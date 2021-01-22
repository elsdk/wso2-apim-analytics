/*
 *  Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

import React from 'react';
import {
    defineMessages, IntlProvider, FormattedMessage, addLocaleData,
} from 'react-intl';
import Axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Widget from '@wso2-dashboards/widget';
import Moment from 'moment';
import APIMApiErrorAnalysis from './APIMApiErrorAnalysis';

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
    typography: {
        useNextVariants: true,
    },
});

const lightTheme = createMuiTheme({
    palette: {
        type: 'light',
    },
    typography: {
        useNextVariants: true,
    },
});

/**
 * Query string parameter
 * @type {string}
 */
const queryParamKey = 'erroranalysis';

/**
 * Language
 * @type {string}
 */
const language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

/**
 * Language without region code
 */
const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

/**
 * Create React Component for APIM Api Error Analysis widget
 * @class APIMApiErrorAnalysisWidget
 * @extends {Widget}
 */
class APIMApiErrorAnalysisWidget extends Widget {
    /**
     * Creates an instance of APIMApiErrorAnalysisWidget.
     * @param {any} props @inheritDoc
     * @memberof APIMApiErrorAnalysisWidget
     */
    constructor(props) {
        super(props);
        this.styles = {
            formControl: {
                margin: 5,
                minWidth: 120,
            },
            selectEmpty: {
                marginTop: 10,
            },
            form: {
                display: 'flex',
                flexWrap: 'wrap',
            },
            paper: {
                padding: '5%',
                border: '2px solid #4555BB',
            },
            paperWrapper: {
                margin: 'auto',
                width: '50%',
                marginTop: '20%',
            },
            proxyPaperWrapper: {
                height: '75%',
            },
            proxyPaper: {
                background: '#969696',
                width: '75%',
                padding: '4%',
                border: '1.5px solid #fff',
                margin: 'auto',
                marginTop: '5%',
            },
        };

        this.state = {
            width: this.props.width,
            height: this.props.height,
            apiSelected: '',
            apiVersion: '',
            versionList: [],
            versionMap: {},
            apiList: [],
            apiDataList: [],
            resultData: [],
            apiFullData: [],
            resourceList: [],
            operationSelected: [],
            resourceSelected: '',
            inProgress: true,
            metadata: this.metadata,
            chartConfig: this.chartConfig,
            proxyError: null,
        };

        // This will re-size the widget when the glContainer's width is changed.
        if (this.props.glContainer !== undefined) {
            this.props.glContainer.on('resize', () => this.setState({
                width: this.props.glContainer.width,
                height: this.props.glContainer.height,
            }));
        }

        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.handleApiListReceived = this.handleApiListReceived.bind(this);
        this.handleApiIdReceived = this.handleApiIdReceived.bind(this);
        this.handlePublisherParameters = this.handlePublisherParameters.bind(this);
        this.assembleMainQuery = this.assembleMainQuery.bind(this);
        this.assembleApiIdQuery = this.assembleApiIdQuery.bind(this);
        this.assembleApiListQuery = this.assembleApiListQuery.bind(this);
        this.assembleResourceQuery = this.assembleResourceQuery.bind(this);
        this.handleResourceReceived = this.handleResourceReceived.bind(this);
        this.apiCreatedHandleChange = this.apiCreatedHandleChange.bind(this);
        this.apiSelectedHandleChange = this.apiSelectedHandleChange.bind(this);
        this.apiVersionHandleChange = this.apiVersionHandleChange.bind(this);
        this.apiOperationHandleChange = this.apiOperationHandleChange.bind(this);
        this.apiResourceHandleChange = this.apiResourceHandleChange.bind(this);
        this.resetState = this.resetState.bind(this);
    }

    componentWillMount() {
        const locale = (languageWithoutRegionCode || language || 'en');
        this.loadLocale(locale).catch(() => {
            this.loadLocale().catch((error) => {
                // TODO: Show error message.
                console.log(error);
            });
        });
    }

    componentDidMount() {
        const { widgetID } = this.props;

        super.getWidgetConfiguration(widgetID)
            .then((message) => {
                this.setState({
                    providerConfig: message.data.configs.providerConfig,
                }, () => super.subscribe(this.handlePublisherParameters));
            })
            .catch((error) => {
                console.error("Error occurred when loading widget '" + widgetID + "'. " + error);
                this.setState({
                    faultyProviderConfig: true,
                });
            });
    }

    componentWillUnmount() {
        const { id } = this.props;
        super.getWidgetChannelManager().unsubscribeWidget(id);
    }

    /**
      * Load locale file
      * @param {string} locale Locale name
      * @memberof APIMApiErrorAnalysisWidget
      * @returns {string}
      */
    loadLocale(locale = 'en') {
        return new Promise((resolve, reject) => {
            Axios
                .get(`${window.contextPath}/public/extensions/widgets/APIMApiErrorAnalysis/locales/${locale}.json`)
                .then((response) => {
                    // eslint-disable-next-line global-require, import/no-dynamic-require
                    addLocaleData(require(`react-intl/locale-data/${locale}`));
                    this.setState({ localeMessages: defineMessages(response.data) });
                    resolve();
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Retrieve params from publisher - DateTimeRange
     * @param {object} receivedMsg timeFrom, TimeTo, perValue
     * @memberof APIMApiErrorAnalysisWidget
    */
    handlePublisherParameters(receivedMsg) {
        const queryParam = super.getGlobalState('dtrp');
        const { sync } = queryParam;

        this.setState({
            timeFrom: receivedMsg.from,
            timeTo: receivedMsg.to,
            perValue: receivedMsg.granularity,
            inProgress: !sync,
        }, this.assembleApiListQuery);
    }

    /**
     * Reset the state according to queryParam
     * @memberof APIMApiErrorAnalysisWidget
     * */
    resetState() {
        this.setState({ inProgress: true, resultData: [] });
        const queryParam = super.getGlobalState(queryParamKey);
        let {
            apiSelected, apiVersion, operationSelected, resourceSelected,
        } = queryParam;
        const { apiList, versionMap } = this.state;
        let versions;

        if (!apiSelected || (apiList && !apiList.includes(apiSelected))) {
            if (apiList.length > 0) {
                [apiSelected] = apiList;
            }
        }
        if (versionMap && apiSelected in versionMap) {
            versions = versionMap[apiSelected];
        } else {
            versions = [];
        }
        if (!apiVersion || !versions.includes(apiVersion)) {
            if (versions.length > 0) {
                [apiVersion] = versions;
            } else {
                apiVersion = '';
            }
        }
        if (!operationSelected) {
            operationSelected = [];
        }
        if (!resourceSelected) {
            resourceSelected = '';
        }

        this.setState({
            apiSelected, apiVersion, operationSelected, resourceSelected, versionList: versions,
        });
        this.setQueryParam(apiSelected, apiVersion, operationSelected, resourceSelected);
    }

    /**
     * Get API list from Publisher
     * @memberof APIMApiErrorAnalysisWidget
     * */
    assembleApiListQuery() {
        this.resetState();
        Axios.get(`${window.contextPath}/apis/analytics/v1.0/apim/apis`)
            .then((response) => {
                this.setState({ proxyError: null });
                this.handleApiListReceived(response.data);
            })
            .catch((error) => {
                console.error(error);
                if (error.response && error.response.data) {
                    let proxyError = error.response.data;
                    proxyError = proxyError.split(':').splice(1).join('').trim();
                    this.setState({ proxyError, inProgress: false });
                }
            });
    }

    /**
     * Formats data retrieved from assembleApiListQuery
     * @param {object} data - data retrieved
     * @memberof APIMApiErrorAnalysisWidget
     * */
    handleApiListReceived(data) {
        const { id } = this.props;
        const { list } = data;

        if (list) {
            this.setState({ apiDataList: list });
        }
        super.getWidgetChannelManager().unsubscribeWidget(id);
        this.assembleApiIdQuery();
    }

    /**
     * Formats the siddhi query - apiidquery
     * @memberof APIMApiErrorAnalysisWidget
     * */
    assembleApiIdQuery() {
        this.resetState();
        const { providerConfig, apiDataList } = this.state;
        const { id, widgetID: widgetName } = this.props;

        if (apiDataList && apiDataList.length > 0) {
            const apiList = [...apiDataList];
            let apiCondition = apiList.map((api) => {
                return '(API_NAME==\'' + api.name + '\' AND API_VERSION==\'' + api.version
                    + '\')';
            });
            apiCondition = apiCondition.join(' OR ');
            const dataProviderConfigs = cloneDeep(providerConfig);
            dataProviderConfigs.configs.config.queryData.queryName = 'apiidquery';
            dataProviderConfigs.configs.config.queryData.queryValues = {
                '{{apiCondition}}': apiCondition,
            };
            super.getWidgetChannelManager()
                .subscribeWidget(id, widgetName, this.handleApiIdReceived, dataProviderConfigs);
        } else {
            this.setState({ inProgress: false, resultData: [] });
        }
    }

    /**
     * Formats data retrieved from assembleApiIdQuery
     * @param {object} message - data retrieved
     * @memberof APIMApiErrorAnalysisWidget
     * */
    handleApiIdReceived(message) {
        const { id } = this.props;
        const queryParam = super.getGlobalState(queryParamKey);
        const { apiSelected } = queryParam;
        const { data } = message;

        if (data && data.length > 0) {
            let apiList = [];
            const versionMap = {};
            data.forEach((dataUnit) => {
                apiList.push(dataUnit[1]);
                // retrieve all entries for the api and get the api versions list
                const versions = data.filter(d => d[1] === dataUnit[1]);
                const versionList = versions.map((ver) => { return ver[2]; });
                versionMap[dataUnit[1]] = versionList;
            });
            apiList = [...new Set(apiList)];
            apiList.sort((a, b) => { return a.toLowerCase().localeCompare(b.toLowerCase()); });
            this.setState({
                apiList, versionMap, apiFullData: data, apiSelected,
            });
        }
        super.getWidgetChannelManager().unsubscribeWidget(id);
        this.assembleResourceQuery();
    }

    /**
     * Formats the siddhi query - resourcequery
     * @memberof APIMApiErrorAnalysisWidget
     * */
    assembleResourceQuery() {
        this.resetState();
        const queryParam = super.getGlobalState(queryParamKey);
        const { apiSelected, apiVersion } = queryParam;
        const { providerConfig, apiFullData } = this.state;
        const { id, widgetID: widgetName } = this.props;

        if (apiFullData && apiFullData.length > 0) {
            const api = apiFullData.filter(apiData => apiSelected === apiData[1] && apiVersion === apiData[2])[0];
            if (api) {
                const dataProviderConfigs = cloneDeep(providerConfig);
                dataProviderConfigs.configs.config.queryData.queryName = 'resourcequery';
                dataProviderConfigs.configs.config.queryData.queryValues = {
                    '{{apiID}}': api[0],
                };
                super.getWidgetChannelManager()
                    .subscribeWidget(id, widgetName, this.handleResourceReceived, dataProviderConfigs);
            } else {
                this.setState({ inProgress: false, resultData: [] });
            }
        } else {
            this.setState({ inProgress: false, resultData: [] });
        }
    }

    /**
     * Formats data retrieved from assembleResourceQuery
     * @param {object} message - data retrieved
     * @memberof APIMApiErrorAnalysisWidget
     * */
    handleResourceReceived(message) {
        const { data } = message;
        const { id } = this.props;

        if (data) {
            const resourceList = [];
            data.forEach((dataUnit) => {
                resourceList.push([dataUnit[0] + ' (' + dataUnit[1]] + ')');
            });
            this.setState({ resourceList });
        }
        super.getWidgetChannelManager().unsubscribeWidget(id);
        this.assembleMainQuery();
    }

    /**
     * Formats the siddhi query - mainquery
     * @memberof APIMApiErrorAnalysisWidget
     * */
    assembleMainQuery() {
        this.resetState();
        const queryParam = super.getGlobalState(queryParamKey);
        const { apiSelected, apiVersion } = queryParam;
        const {
            providerConfig, timeFrom, timeTo, perValue, operationSelected, resourceSelected,
        } = this.state;
        const { widgetID: widgetName, id } = this.props;
        const dataProviderConfigs = cloneDeep(providerConfig);
        dataProviderConfigs.configs.config.queryData.queryName = 'mainquery';

        if (apiSelected !== '' && apiVersion !== '' && (operationSelected.length > 0 || resourceSelected.length > 0)) {
            let resources = '';
            let numberOfSelectedElements = 0;

            if (operationSelected.length > 0) {
                const operations = [];
                const operationTypes = [];
                let operationsString = '';
                let method = '';
                operationSelected.forEach((res) => {
                    const resFormat = res.split(' (');
                    operations.push(resFormat[0]);
                    method = resFormat[1].replace(')', '');
                    operationTypes.push(method);
                    numberOfSelectedElements += 1;
                });

                for (let i = 0; i < operations.length - 1; i++) {
                    operationsString += 'str:contains(apiResourceTemplate,\'' + operations[i] + '\') AND ';
                }
                operationsString += 'str:contains(apiResourceTemplate,\'' + operations[operations.length - 1] + '\')';

                resources = '((' + operationsString + ') AND apiMethod==\'' + method + '\')';
            } else if (resourceSelected.length > 0) {
                const resFormat = resourceSelected.split(' (');
                const resource = resFormat[0];
                const method = resFormat[1].replace(')', '');
                numberOfSelectedElements = 1;
                resources = '(apiResourceTemplate==\'' + resource + '\' AND apiMethod==\'' + method + '\')';
            }

            const queryCondition = '(apiName==\'' + apiSelected + '\' AND apiVersion==\''
                + apiVersion + '\' AND (' + resources + '))';

            dataProviderConfigs.configs.config.queryData.queryValues = {
                '{{timeFrom}}': timeFrom,
                '{{timeTo}}': timeTo,
                '{{per}}': perValue,
                '{{querystring}}': queryCondition,
                '{{numberOfCommas}}': numberOfSelectedElements - 1,
            };
            super.getWidgetChannelManager()
                .subscribeWidget(id, widgetName, this.handleDataReceived, dataProviderConfigs);
        } else {
            this.setState({ inProgress: false, resultData: [] });
        }
    }

    /**
     * Formats data retrieved from assembleMainQuery
     * @param {object} message - data retrieved
     * @memberof APIMApiErrorAnalysisWidget
     * */
    handleDataReceived(message) {
        const resultData = [];
        const { data } = message;

        if (data) {
            const {
                apiSelected, apiVersion, operationSelected, resourceSelected,
            } = this.state;
            data.forEach((element) => {
                resultData.push([Moment(element[1]).format('YYYY/MM/DD hh:mm'), element[3], element[0]]);
            });
            this.setState({
                resultData, inProgress: false,
            });
            this.setQueryParam(apiSelected, apiVersion, operationSelected, resourceSelected);
        } else {
            this.setState({ inProgress: false, resultData: [] });
        }
    }

    /**
     * Updates query param values
     * @param {string} apiSelected - API Name menu option selected
     * @param {string} apiVersion - API Version menu option selected
     * @param {string} operationSelected - Resources selected
     * @param {string} resourceSelected - Resource selected
     * @memberof APIMApiErrorAnalysisWidget
     * */
    setQueryParam(apiSelected, apiVersion, operationSelected, resourceSelected) {
        super.setGlobalState(queryParamKey, {
            apiSelected,
            apiVersion,
            operationSelected,
            resourceSelected,
        });
    }

    /**
     * Handle API Created By menu select change
     * @param {Event} event - listened event
     * @memberof APIMApiErrorAnalysisWidget
     * */
    apiCreatedHandleChange(event) {
        const { id } = this.props;
        const { value } = event.target;
        this.setQueryParam(value, '', '', []);
        super.getWidgetChannelManager().unsubscribeWidget(id);
        this.setState({ inProgress: true }, this.assembleApiIdQuery);
    }

    /**
     * Handle API name menu select change
     * @param {Event} event - listened event
     * @memberof APIMApiErrorAnalysisWidget
     * */
    apiSelectedHandleChange(event) {
        const { id } = this.props;
        const { value } = event.target;
        this.setQueryParam(value, '', []);
        super.getWidgetChannelManager().unsubscribeWidget(id);
        this.setState({
            apiSelected: value,
            versionList: [],
            resourceList: [],
            inProgress: true,
        }, this.assembleResourceQuery);
    }

    /**
     * Handle API Version menu select change
     * @param {Event} event - listened event
     * @memberof APIMApiErrorAnalysisWidget
     * */
    apiVersionHandleChange(event) {
        const { apiSelected } = this.state;
        const { id } = this.props;
        const { value } = event.target;
        this.setQueryParam(apiSelected, value, []);
        super.getWidgetChannelManager().unsubscribeWidget(id);
        this.setState({
            apiVersion: value,
            inProgress: true,
            resourceList: [],
        }, this.assembleResourceQuery);
    }

    /**
     * Handle operation select change
     * @param {Event} event - listened event
     * @memberof APIMApiErrorAnalysisWidget
     * */
    apiOperationHandleChange(event) {
        const { id } = this.props;
        const { value } = event.target;
        const queryParam = super.getGlobalState(queryParamKey);
        const {
            apiSelected, apiVersion, operationSelected,
        } = this.state;

        if (queryParam.operationSelected.includes(value)) {
            operationSelected.splice(operationSelected.indexOf(value), 1);
        } else {
            operationSelected.push(value);
        }
        this.setState({ operationSelected, inProgress: true });
        this.setQueryParam(apiSelected, apiVersion, operationSelected);
        super.getWidgetChannelManager().unsubscribeWidget(id);
        this.assembleMainQuery();
    }

    /**
    * Handle operation select change
    * @param {Event} event - listened event
    * @memberof APIMApiErrorAnalysisWidget
    * */
    apiResourceHandleChange(event) {
        const { id } = this.props;
        const { value } = event.target;
        const { apiSelected, apiVersion } = this.state;
        this.state.resourceSelected = value;

        this.setState({ resourceSelected: value, inProgress: true });
        this.setQueryParam(apiSelected, apiVersion, [], value);
        super.getWidgetChannelManager().unsubscribeWidget(id);
        this.assembleMainQuery();
    }

    /**
     * @inheritDoc
     * @returns {ReactElement} Render the APIM Api Error Analysis Widget
     * @memberof APIMApiErrorAnalysisWidget
     */
    render() {
        const queryParam = super.getGlobalState(queryParamKey);
        const {
            localeMessages, faultyProviderConfig, chartConfig, metadata, height, width, inProgress, proxyError,
            apiSelected, apiVersion, resultData, apiList, versionList, resourceList,
        } = this.state;
        const {
            paper, paperWrapper, proxyPaper, proxyPaperWrapper,
        } = this.styles;
        const { muiTheme } = this.props;
        const themeName = muiTheme.name;
        const latencyProps = {
            themeName,
            queryParam,
            chartConfig,
            metadata,
            height,
            width,
            apiSelected,
            apiVersion,
            resultData,
            apiList,
            versionList,
            resourceList,
            inProgress,
        };

        return (
            <IntlProvider locale={language} messages={localeMessages}>
                <MuiThemeProvider theme={themeName === 'dark' ? darkTheme : lightTheme}>
                    { proxyError ? (
                        <div style={proxyPaperWrapper}>
                            <Paper
                                elevation={1}
                                style={proxyPaper}
                            >
                                <Typography variant='h5' component='h3'>
                                    <FormattedMessage
                                        id='apim.server.error.heading'
                                        defaultMessage='Error!'
                                    />
                                </Typography>
                                <Typography component='p'>
                                    { proxyError }
                                </Typography>
                            </Paper>
                        </div>
                    ) : (
                        <div>
                            {
                                faultyProviderConfig ? (
                                    <div style={paperWrapper}>
                                        <Paper
                                            elevation={1}
                                            style={paper}
                                        >
                                            <Typography variant='h5' component='h3'>
                                                <FormattedMessage
                                                    id='config.error.heading'
                                                    defaultMessage='Configuration Error !'
                                                />
                                            </Typography>
                                            <Typography component='p'>
                                                <FormattedMessage
                                                    id='config.error.body'
                                                    defaultMessage={'Cannot fetch provider configuration for APIM '
                                                    + 'Api Latency Time widget'}
                                                />
                                            </Typography>
                                        </Paper>
                                    </div>
                                ) : (
                                    <APIMApiErrorAnalysis
                                        {...latencyProps}
                                        apiSelectedHandleChange={this.apiSelectedHandleChange}
                                        apiVersionHandleChange={this.apiVersionHandleChange}
                                        apiOperationHandleChange={this.apiOperationHandleChange}
                                        apiResourceHandleChange={this.apiResourceHandleChange}
                                    />
                                )
                            }
                        </div>
                    )}
                </MuiThemeProvider>
            </IntlProvider>
        );
    }
}

global.dashboard.registerWidget('APIMApiErrorAnalysis', APIMApiErrorAnalysisWidget);

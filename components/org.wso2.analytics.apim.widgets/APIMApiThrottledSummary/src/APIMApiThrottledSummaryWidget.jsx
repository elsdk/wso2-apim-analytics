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
import { Scrollbars } from 'react-custom-scrollbars';
import {
    addLocaleData, defineMessages, IntlProvider, FormattedMessage,
} from 'react-intl';
import Axios from 'axios';
import Moment from 'moment';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Widget from '@wso2-dashboards/widget';
import APIMApiThrottledSummary from './APIMApiThrottledSummary';

const LAST_DAY = 'last-day';
const THIS_DAY = 'this-day';

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
 * Language
 * @type {string}
 */
const language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

let refreshIntervalId1 = null;
let refreshIntervalId2 = null;

/**
 * Language without region code
 */
const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

/**
 * Create React Component for APIM Api Created
 * @class APIMApiThrottledSummaryWidget
 * @extends {Widget}
 */
class APIMApiThrottledSummaryWidget extends Widget {
    /**
     * Creates an instance of APIMApiThrottledSummaryWidget.
     * @param {any} props @inheritDoc
     * @memberof APIMApiThrottledSummaryWidget
     */
    constructor(props) {
        super(props);

        this.state = {
            width: this.props.width,
            height: this.props.height,
            lastDayCount: 0,
            thisDayCount: 0,
            messages: null,
            refreshInterval: 60000, // 1min
            refreshIntervalId: null,
            inProgress: true,
        };

        this.styles = {
            paper: {
                padding: '5%',
                border: '2px solid #4555BB',
            },
            paperWrapper: {
                margin: 'auto',
                width: '50%',
                marginTop: '20%',
            },
        };

        // This will re-size the widget when the glContainer's width is changed.
        if (this.props.glContainer !== undefined) {
            this.props.glContainer.on('resize', () => this.setState({
                width: this.props.glContainer.width,
                height: this.props.glContainer.height,
            }));
        }
        this.assembleUsageCountQuery = this.assembleUsageCountQuery.bind(this);
        this.handleUsageCountReceived = this.handleUsageCountReceived.bind(this);
        this.handleOnClick = this.handleOnClick.bind(this);
    }

    /**
     *
     * @param {any} props @inheritDoc
     */
    componentWillMount() {
        const locale = (languageWithoutRegionCode || language || 'en');
        this.loadLocale(locale).catch(() => {
            this.loadLocale().catch(() => {
                // TODO: Show error message.
            });
        });
    }

    /**
     *
     * @param {any} props @inheritDoc
     */
    componentDidMount() {
        const { widgetID, id } = this.props;
        const { refreshInterval } = this.state;

        super.getWidgetConfiguration(widgetID)
            .then((message) => {
                // set an interval to periodically retrieve data
                const refresh = () => {
                    super.getWidgetChannelManager().unsubscribeWidget(id + LAST_DAY);
                    this.assembleUsageCountQuery(LAST_DAY, message.data.configs.providerConfig);
                };
                refreshIntervalId1 = setInterval(refresh, refreshInterval);
                this.assembleUsageCountQuery(LAST_DAY, message.data.configs.providerConfig);
            })
            .catch((error) => {
                console.error("Error occurred when loading widget '" + widgetID + "'. " + error);
                this.setState({
                    faultyProviderConfig: true,
                });
            });

        super.getWidgetConfiguration(widgetID)
            .then((message) => {
                // set an interval to periodically retrieve data
                const refresh = () => {
                    super.getWidgetChannelManager().unsubscribeWidget(id + THIS_DAY);
                    this.assembleUsageCountQuery(THIS_DAY, message.data.configs.providerConfig);
                };
                refreshIntervalId2 = setInterval(refresh, refreshInterval);
                this.assembleUsageCountQuery(THIS_DAY, message.data.configs.providerConfig);
            })
            .catch((error) => {
                console.error("Error occurred when loading widget '" + widgetID + "'. " + error);
                this.setState({
                    faultyProviderConfig: true,
                });
            });
    }

    /**
     *
     * @param {any} props @inheritDoc
     */
    componentWillUnmount() {
        const { id } = this.props;
        clearInterval(refreshIntervalId1);
        clearInterval(refreshIntervalId2);
        super.getWidgetChannelManager().unsubscribeWidget(id + THIS_DAY);
        super.getWidgetChannelManager().unsubscribeWidget(id + LAST_DAY);
    }

    /**
     * Load locale file.
     * @memberof APIMApiThrottledSummaryWidget
     * @param {String} locale - locale
     * @returns {Promise}
     */
    loadLocale(locale = 'en') {
        return new Promise((resolve, reject) => {
            Axios
                .get(`${window.contextPath}/public/extensions/widgets/APIMApiThrottledSummary/locales/${locale}.json`)
                .then((response) => {
                    // eslint-disable-next-line global-require, import/no-dynamic-require
                    addLocaleData(require(`react-intl/locale-data/${locale}`));
                    this.setState({ messages: defineMessages(response.data) });
                    resolve();
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Formats the siddhi query
     * @param {string} day - This day/Last day
     * @param {object} dataProviderConfigs - Data provider configurations
     * @memberof APIMApiThrottledSummaryWidget
     * */
    assembleUsageCountQuery(day, dataProviderConfigs) {
        const { id, widgetID: widgetName } = this.props;
        dataProviderConfigs.configs.config.queryData.queryName = 'query';

        let timeTo = new Date().getTime();
        let timeFrom = Moment(timeTo).subtract(1, 'days').toDate().getTime();
        if (day === LAST_DAY) {
            timeTo = timeFrom;
            timeFrom = Moment(timeTo).subtract(1, 'days').toDate().getTime();
        }

        dataProviderConfigs.configs.config.queryData.queryValues = {
            '{{apiCreator}}': '',
            '{{from}}': timeFrom,
            '{{to}}': timeTo,
            '{{per}}': 'day',
        };

        super.getWidgetChannelManager()
            .subscribeWidget(id + day, widgetName, (message) => {
                this.handleUsageCountReceived(day, message);
            }, dataProviderConfigs);
    }

    /**
     * Formats data received from assembleweekQuery
     * @param {string} day - This day/Last day
     * @param {object} message - data retrieved
     * @memberof APIMApiThrottledSummaryWidget
     * */
    handleUsageCountReceived(day, message) {
        const { data } = message;
        const count = data[0] || [];
        if (count.length) {
            if (day === THIS_DAY) {
                this.setState({
                    thisDayCount: count[0] || 0,
                    inProgress: false,
                });
            }
            if (day === LAST_DAY) {
                this.setState({
                    lastDayCount: count[0] || 0,
                    inProgress: false,
                });
            }
        } else {
            this.setState({ inProgress: false });
        }
    }

    /**
     * Handle onClick and drill down
     * @memberof APIMApiThrottledSummaryWidget
     * */
    handleOnClick() {
        const { configs } = this.props;

        if (configs && configs.options) {
            const { drillDown } = configs.options;

            if (drillDown) {
                const locationParts = window.location.pathname.split('/');
                const dashboard = locationParts[locationParts.length - 2];
                const queryParams = {
                    dtrp: {
                        tr: '1day',
                    },
                };
                window.location.href = window.contextPath
                    + '/dashboards/' + dashboard + '/' + drillDown + '?widgetStates='
                    + encodeURI(JSON.stringify(queryParams));
            }
        }
    }

    /**
     * @inheritDoc
     * @returns {ReactElement} Render the APIM Api Created widget
     * @memberof APIMApiThrottledSummaryWidget
     */
    render() {
        const {
            messages, faultyProviderConf, lastDayCount, thisDayCount, inProgress, height,
        } = this.state;
        const {
            paper, paperWrapper,
        } = this.styles;
        const { muiTheme } = this.props;
        const themeName = muiTheme.name;
        const apiThrottleProps = {
            themeName, lastDayCount, thisDayCount, inProgress, height,
        };

        return (
            <IntlProvider locale={language} messages={messages}>
                <MuiThemeProvider theme={themeName === 'dark' ? darkTheme : lightTheme}>
                    <Scrollbars style={{
                                    height,
                                    backgroundColor: themeName === 'dark' ? '#0e1e33' : '#fff',
                                }}
                    >
                        {
                            faultyProviderConf ? (
                                <div style={paperWrapper}>
                                    <Paper elevation={1} style={paper}>
                                        <Typography variant='h5' component='h3'>
                                            <FormattedMessage
                                                id='config.error.heading'
                                                defaultMessage='Configuration Error !'
                                            />
                                        </Typography>
                                        <Typography component='p'>
                                            <FormattedMessage
                                                id='config.error.body'
                                                defaultMessage={'Cannot fetch provider configuration for APIM Api '
                                                    + 'Throttled Summary widget'}
                                            />
                                        </Typography>
                                    </Paper>
                                </div>
                            ) : (
                                <APIMApiThrottledSummary
                                    {...apiThrottleProps}
                                    handleOnClick={this.handleOnClick}
                                />
                            )
                        }
                    </Scrollbars>
                </MuiThemeProvider>
            </IntlProvider>
        );
    }
}

global.dashboard.registerWidget('APIMApiThrottledSummary', APIMApiThrottledSummaryWidget);

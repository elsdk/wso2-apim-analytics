/*
 *  Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Scrollbars } from 'react-custom-scrollbars';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {
    VictoryPie, VictoryLegend, VictoryTooltip, VictoryTheme,
} from 'victory';
import { colorScale, Utils } from '@analytics-apim/common-lib';
import sumBy from 'lodash/sumBy';
import CustomTable from './CustomTable';

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
 * React Component for APIM Alert Summary By APIs widget body
 * @param {any} props @inheritDoc
 * @returns {ReactElement} Render the APIM Alert Summary By APIs widget body
 */
function APIMAlertSummaryByAPIs(props) {
    const {
        themeName, height, limit, alertData, handleChange, inProgress, width, handleOnClickAPI, username, intl,
    } = props;
    const fontSize = width < 1000 ? 16 : 18;
    const styles = {
        headingWrapper: {
            margin: 'auto',
            width: '95%',
        },
        paperWrapper: {
            height: '75%',
            width: '95%',
            margin: 'auto',
        },
        paper: {
            background: themeName === 'dark' ? '#152638' : '#E8E8E8',
            padding: '4%',
        },
        formWrapper: {
            // marginBottom: '5%',
        },
        form: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        statDiv: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        pieDiv: {
            width: width > 1000 ? '50%' : '100%',
        },
        tableDiv: {
            width: width > 1000 ? '50%' : '100%',
        },
        formControl: {
            marginLeft: '5%',
            // marginTop: '5%',
            minWidth: 120,
        },
        loadingIcon: {
            margin: 'auto',
            display: 'block',
        },
        loading: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height,
        },
        victoryTooltip: {
            fill: '#fff',
            fontSize,
        },
        victoryLegend: {
            labels: {
                fill: '#9e9e9e',
                fontSize,
            },
        },
        flyoutStyle: {
            fill: '#000',
            fillOpacity: '0.5',
            strokeWidth: 1,
        },
        heading: {
            margin: 'auto',
            textAlign: 'center',
            fontWeight: 'normal',
            letterSpacing: 1.5,
            marginTop: 0,
        },
        subheading: {
            textAlign: 'center',
            margin: 5,
            fontSize: 14,
            color: '#b5b5b5',
        },
        pieChart: {
            data: {
                cursor: 'pointer',
            },
        },
    };
    const columns = [
        {
            id: 'apiname', numeric: false, disablePadding: false, label: 'table.heading.apiname',
        },
        {
            id: 'count', numeric: true, disablePadding: false, label: 'table.heading.count',
        },
    ];
    const strColumns = columns.map((colObj) => {
        return intl.formatMessage({ id: colObj.label });
    });
    const title = intl.formatMessage({ id: 'widget.heading' });
    const { pieChartData, legendData } = Utils.summarizePieData(alertData, 'apiname', 'count');
    return (
        <MuiThemeProvider
            theme={themeName === 'dark' ? darkTheme : lightTheme}
        >
            <Scrollbars style={{
                height,
                backgroundColor: themeName === 'dark' ? '#0e1e33' : '#fff',
            }}
            >
                <div style={{
                    backgroundColor: themeName === 'dark' ? '#0e1e33' : '#fff',
                    margin: '10px',
                    padding: '20px',
                }}
                >
                    <div style={styles.headingWrapper}>
                        <h3 style={styles.heading}>
                            <FormattedMessage id='widget.heading' defaultMessage='TOP API BY ALERT COUNT' />
                        </h3>
                        <p style={styles.subheading}>
                            <FormattedMessage id='api.info.subheading' defaultMessage='(Last 7 Days)' />
                        </p>
                    </div>
                    <div style={styles.formWrapper}>
                        <form style={styles.form} noValidate autoComplete='off'>
                            <TextField
                                id='limit-number'
                                label={<FormattedMessage id='limit' defaultMessage='Limit' />}
                                value={limit}
                                onChange={handleChange}
                                type='number'
                                style={styles.formControl}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                margin='normal'
                            />
                        </form>
                    </div>
                    <div>
                        { inProgress ? (
                            <div style={styles.loading}>
                                <CircularProgress style={styles.loadingIcon} />
                            </div>
                        ) : (
                            <div>
                                { !alertData || alertData.length === 0 ? (
                                    <div style={styles.paperWrapper}>
                                        <Paper
                                            elevation={1}
                                            style={styles.paper}
                                        >
                                            <Typography variant='h5' component='h3'>
                                                <FormattedMessage
                                                    id='nodata.error.heading'
                                                    defaultMessage='No Data Available !'
                                                />
                                            </Typography>
                                            <Typography component='p'>
                                                <FormattedMessage
                                                    id='nodata.error.body'
                                                    defaultMessage='No data available for the selected options.'
                                                />
                                            </Typography>
                                        </Paper>
                                    </div>
                                ) : (
                                    <div style={styles.statDiv}>
                                        <div style={styles.pieDiv}>
                                            <svg viewBox='-50 0 1000 500'>
                                                <VictoryLegend
                                                    standalone={false}
                                                    theme={VictoryTheme.material}
                                                    colorScale={colorScale}
                                                    x={460}
                                                    y={20}
                                                    gutter={20}
                                                    rowGutter={styles.rowGutter}
                                                    style={styles.victoryLegend}
                                                    data={legendData}
                                                />
                                                <VictoryPie
                                                    labelComponent={(
                                                        <VictoryTooltip
                                                            orientation='right'
                                                            pointerLength={0}
                                                            cornerRadius={2}
                                                            flyoutStyle={styles.flyoutStyle}
                                                            style={styles.victoryTooltip}
                                                            theme={VictoryTheme.material}
                                                        />
                                                    )}
                                                    width={500}
                                                    height={500}
                                                    standalone={false}
                                                    innerRadius={130}
                                                    padding={50}
                                                    theme={VictoryTheme.material}
                                                    colorScale={colorScale}
                                                    style={styles.pieChart}
                                                    data={pieChartData}
                                                    x={d => d.apiname}
                                                    y={d => d.count}
                                                    labels={d => `${d.apiname} : ${((d.count
                                                        / (sumBy(pieChartData, o => o.count))) * 100)
                                                        .toFixed(2)}%`}
                                                    events={[
                                                        {
                                                            target: 'data',
                                                            eventHandlers: {
                                                                onClick: (e) => {
                                                                    return [{
                                                                        mutation: (val) => {
                                                                            handleOnClickAPI(e, val.datum);
                                                                        },
                                                                    }];
                                                                },
                                                            },
                                                        },
                                                    ]}
                                                />
                                            </svg>
                                        </div>
                                        <div style={styles.tableDiv}>
                                            <CustomTable
                                                data={alertData}
                                                onClickTableRow={(e, v) => handleOnClickAPI(e, v)}
                                                columns={columns}
                                                strColumns={strColumns}
                                                title={title}
                                                username={username}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Scrollbars>
        </MuiThemeProvider>
    );
}

APIMAlertSummaryByAPIs.propTypes = {
    themeName: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    width: PropTypes.string.isRequired,
    limit: PropTypes.string.isRequired,
    alertData: PropTypes.instanceOf(Object).isRequired,
    handleChange: PropTypes.func.isRequired,
    handleOnClickAPI: PropTypes.func.isRequired,
    inProgress: PropTypes.bool.isRequired,
    intl: intlShape.isRequired,
    username: PropTypes.string.isRequired,
};

export default injectIntl(APIMAlertSummaryByAPIs);

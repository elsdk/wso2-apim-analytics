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
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Scrollbars } from 'react-custom-scrollbars';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import VizG from 'react-vizgrammar';

/**
 * React Component for Top 10 Throttled Apis Over Time widget body
 * @param {any} props @inheritDoc
 * @returns {ReactElement} Render the Top 10 Throttled Apis Over Time widget body
 */
export default function Top10ThrottledApisOverTime(props) {
    const {
        themeName, height, width, inProgress, throttleData, apiList, handleOnClick,
    } = props;
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
        heading: {
            margin: 'auto',
            textAlign: 'center',
            fontWeight: 'normal',
            letterSpacing: 1.5,
            paddingBottom: '10px',
            marginTop: 0,
        },
        divClick: {
            cursor: 'pointer',
        },
    };
    const chartConfig = {
        x: 'TIME',
        yAxisLabel: 'COUNT',
        append: false,
        charts: [],
        maxLength: 60,
        height: 400,
        interactiveLegend: true,
        legend: true,
        disableVerticalGrid: true,
        xAxisTickCount: 4,
        timeFormat: '%d-%b-%y %H:%M',
        tipTimeFormat: '%Y-%m-%d %H:%M:%S',
        ignoreYaxisDecimalPoints: true,
        style: {
            xAxisTickAngle: -8,
            tickLabelColor: '#a7b0c8',
            axisLabelColor: '#a7b0c8',
            axisTextSize: 10,
            legendTextColor: '#a7b0c8',
            legendTextSize: 15,
        },
    };
    const metadata = {
        names: [],
        types: [],
    };


    if (throttleData) {
        metadata.names = apiList.map((dataUnit) => { return dataUnit; });
        metadata.names.push('TIME');
        metadata.types = apiList.map(() => { return 'linear'; });
        metadata.types.push('time');
        chartConfig.charts = apiList.map((dataUnit) => { return { type: 'line', y: dataUnit }; });
    }

    return (
        <Scrollbars style={{
            height,
            backgroundColor: themeName === 'dark' ? '#0e1e33' : '#fff',
        }}
        >
            <div
                style={{
                    backgroundColor: themeName === 'dark' ? '#0e1e33' : '#fff',
                    margin: '10px',
                    padding: '20px',
                }}
            >
                <div style={styles.headingWrapper}>
                    <div style={styles.heading}>
                        <FormattedMessage id='widget.heading' defaultMessage='TOP 10 THROTTLED OUT APIS DURING PAST 30 DAYS' />
                    </div>
                </div>
                { inProgress ? (
                    <div style={styles.loading}>
                        <CircularProgress style={styles.loadingIcon} />
                    </div>
                ) : (
                    <div>
                        { !throttleData || throttleData.length === 0 ? (
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
                            <div
                                style={styles.divClick}
                                onClick={() => handleOnClick()}
                                onKeyDown={() => handleOnClick()}
                            >
                                <VizG
                                    config={chartConfig}
                                    metadata={metadata}
                                    data={throttleData}
                                    width={width}
                                    height={height * 0.9}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Scrollbars>
    );
}

Top10ThrottledApisOverTime.propTypes = {
    themeName: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    width: PropTypes.string.isRequired,
    throttleData: PropTypes.instanceOf(Object).isRequired,
    apiList: PropTypes.instanceOf(Object).isRequired,
    inProgress: PropTypes.bool.isRequired,
    handleOnClick: PropTypes.func.isRequired,
};

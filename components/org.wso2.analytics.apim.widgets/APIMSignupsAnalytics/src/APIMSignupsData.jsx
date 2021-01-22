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
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import VizG from 'react-vizgrammar';
import CustomTable from './CustomTable';

/**
 * React Component for the data of APIM Signups Analytics widget
 * @param {any} props @inheritDoc
 * @returns {ReactElement} Render the data of APIM Signups Analytics widget
 */
function APIMSignupsData(props) {
    const {
        themeName, chartData, tableData, width, intl, username,
    } = props;
    const styles = {
        paperWrapper: {
            height: '75%',
            width: '95%',
            margin: 'auto',
        },
        paper: {
            background: themeName === 'dark' ? '#152638' : '#E8E8E8',
            padding: '4%',
        },
        dataWrapper: {
            height: '78%',
            width: '97%',
            margin: 'auto',
        },
        chartWrapper: {
            width: '95%',
        },
        tableWrapper: {
            paddingTop: '20px',
        },
    };
    const chartConfig = {
        x: 'SIGNUP_TIME',
        charts: [
            {
                type: 'line',
                y: 'COUNT',
                fill: '#958E94',
            },
        ],
        maxLength: 60,
        width: 800,
        height: 400,
        append: false,
        xAxisTickCount: 4,
        legend: false,
        disableVerticalGrid: true,
        timeFormat: '%d-%b-%y %H:%M',
        tipTimeFormat: '%Y-%m-%d %H:%M:%S',
        ignoreYaxisDecimalPoints: true,
        style: {
            xAxisTickAngle: -10,
            tickLabelColor: '#a7b0c8',
            axisLabelColor: '#a7b0c8',
            axisTextSize: 10,
        },
    };
    const metadata = {
        names: ['COUNT', 'SIGNUP_TIME'],
        types: ['linear', 'time'],
    };
    const columns = [
        {
            id: 'developer', numeric: false, disablePadding: false, label: 'table.heading.developer',
        },
        {
            id: 'signeduptime', numeric: false, disablePadding: false, label: 'table.heading.signeduptime',
        },
    ];
    const strColumns = columns.map((colObj) => {
        return intl.formatMessage({ id: colObj.label });
    });
    const title = intl.formatMessage({ id: 'widget.heading' });

    if (tableData.length !== 0 && chartData.length !== 0) {
        return (
            <div style={styles.dataWrapper}>
                <div style={styles.chartWrapper}>
                    <VizG
                        config={chartConfig}
                        metadata={metadata}
                        data={chartData}
                        width={width}
                    />
                </div>
                <div style={styles.tableWrapper}>
                    <CustomTable
                        data={tableData}
                        columns={columns}
                        strColumns={strColumns}
                        title={title}
                        username={username}
                    />
                </div>
            </div>
        );
    } else {
        return (
            <div style={styles.paperWrapper}>
                <Paper
                    elevation={1}
                    style={styles.paper}
                >
                    <Typography variant='h5' component='h3'>
                        <FormattedMessage id='nodata.error.heading' defaultMessage='No Data Available !' />
                    </Typography>
                    <Typography component='p'>
                        <FormattedMessage
                            id='nodata.error.body'
                            defaultMessage='No matching data available for the selected options.'
                        />
                    </Typography>
                </Paper>
            </div>
        );
    }
}

APIMSignupsData.propTypes = {
    themeName: PropTypes.string.isRequired,
    width: PropTypes.string.isRequired,
    chartData: PropTypes.instanceOf(Object).isRequired,
    tableData: PropTypes.instanceOf(Object).isRequired,
    intl: intlShape.isRequired,
    username: PropTypes.string.isRequired,
};

export default injectIntl(APIMSignupsData);

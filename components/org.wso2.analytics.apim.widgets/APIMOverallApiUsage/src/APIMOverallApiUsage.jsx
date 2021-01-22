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
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import VizG from 'react-vizgrammar';
import CustomTable from './CustomTable';

/**
 * React Component for Api Overall Api Usage widget body
 * @param {any} props @inheritDoc
 * @returns {ReactElement} Render the Overall Api Usage widget body
 */
function APIMOverallApiUsage(props) {
    const {
        themeName, width, height, limit, usageData1, usageData2, limitHandleChange, inProgress, handleOnClickAPI,
        selectedAPIChangeCallback, intl, username,
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
        formWrapper: {
            paddingBottom: 20,
        },
        formControl: {
            marginLeft: 10,
            marginTop: 10,
            width: '10%',
        },
        dataWrapper: {
            height: '80%',
        },
        chartWrapper: {
            width: '100%',
            height: '70%',
        },
        tableWrapper: {
            height: '30%',
            margin: 'auto',
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
        formLabel: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            width: '100%',
            display: 'block',
            overflow: 'hidden',
        },
        heading: {
            margin: 'auto',
            textAlign: 'center',
            fontWeight: 'normal',
            letterSpacing: 1.5,
            paddingBottom: '10px',
            marginTop: 0,
        },
    };
    const columns = [
        {
            id: 'apiname', numeric: false, disablePadding: false, label: 'table.heading.apiname',
        },
        {
            id: 'apiVersion', numeric: true, disablePadding: false, label: 'table.heading.apiversion',
        },
        {
            id: 'hits', numeric: true, disablePadding: false, label: 'table.heading.hits',
        },
    ];
    const strColumns = columns.map((colObj) => {
        return intl.formatMessage({ id: colObj.label });
    });
    const title = intl.formatMessage({ id: 'widget.heading' });
    const chartConfig = {
        charts: [
            {
                type: 'scatter',
                x: 'API_NAME',
                y: 'SUB_COUNT',
                color: 'CREATED_BY',
                size: 'REQ_COUNT',
            },
        ],
        append: false,
        ignoreYaxisDecimalPoints: true,
        style: {
            xAxisTickAngle: -8,
            tickLabelColor: '#506482',
        },
    };
    const metadata = {
        names: ['API_NAME', 'CREATED_BY', 'REQ_COUNT', 'SUB_COUNT'],
        types: ['ordinal', 'ordinal', 'linear', 'linear'],
    };

    let chartData = [];

    if (usageData1) {
        chartData = usageData1.map((data) => { return [data[0] + ' (' + data[4] + ')', data[1], data[2], data[3]]; });
        chartData.sort((a, b) => { return a[0].toLowerCase().localeCompare(b[0].toLowerCase()); });
    }

    return (
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
                    <div style={styles.heading}>
                        <FormattedMessage id='widget.heading' defaultMessage='OVERALL API USAGE' />
                    </div>
                </div>
                <div style={styles.formWrapper}>
                    <form noValidate autoComplete='off'>
                        <FormControl style={styles.formControl}>
                            <Tooltip
                                placement='top'
                                title={<FormattedMessage id='limit' defaultMessage='Limit' />}
                            >
                                <InputLabel
                                    shrink
                                    htmlFor='limit-number'
                                    style={styles.formLabel}
                                >
                                    <FormattedMessage id='limit' defaultMessage='Limit' />
                                </InputLabel>
                            </Tooltip>
                            <Input
                                id='limit-number'
                                value={limit}
                                onChange={limitHandleChange}
                                type='number'
                                margin='normal'
                            />
                        </FormControl>
                    </form>
                </div>
                {inProgress ? (
                    <div style={styles.loading}>
                        <CircularProgress style={styles.loadingIcon} />
                    </div>
                ) : (
                    <div>
                        {
                            !usageData1 || usageData1.length === 0 ? (
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
                                <div style={styles.dataWrapper}>
                                    <div style={styles.chartWrapper}>
                                        <VizG
                                            config={chartConfig}
                                            metadata={metadata}
                                            data={chartData}
                                            width={width}
                                            theme={themeName}
                                        />
                                    </div>
                                </div>
                            )
                        }
                        {
                            usageData2 && usageData2.length > 0 && (
                                <div style={styles.tableWrapper}>
                                    <CustomTable
                                        data={usageData2}
                                        callBack={selectedAPIChangeCallback}
                                        columns={columns}
                                        onClickTableRow={e => handleOnClickAPI(e)}
                                        strColumns={strColumns}
                                        title={title}
                                        username={username}
                                    />
                                </div>
                            )
                        }
                    </div>
                )
                }
            </div>
        </Scrollbars>
    );
}

APIMOverallApiUsage.propTypes = {
    themeName: PropTypes.string.isRequired,
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    limit: PropTypes.string.isRequired,
    usageData1: PropTypes.instanceOf(Object).isRequired,
    usageData2: PropTypes.instanceOf(Object).isRequired,
    limitHandleChange: PropTypes.func.isRequired,
    selectedAPIChangeCallback: PropTypes.func.isRequired,
    inProgress: PropTypes.bool.isRequired,
    handleOnClickAPI: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    username: PropTypes.string.isRequired,
};

export default injectIntl(APIMOverallApiUsage);

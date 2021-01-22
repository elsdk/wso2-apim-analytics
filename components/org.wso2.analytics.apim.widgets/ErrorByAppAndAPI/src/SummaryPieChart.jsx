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
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {
    VictoryPie, VictoryTheme, VictoryClipContainer, VictoryTooltip,
} from 'victory';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import { colorScale } from '@analytics-apim/common-lib';
import { withStyles } from '@material-ui/core/styles';
import { ViewTypeEnum } from '../../AppAndAPIErrorTable/src/Constants';

const styles = {
    header: {
        textAlign: 'center',
    },
    table: {
        maxWidth: 300,
        marginBottom: 50,
        padding: 0,
    },
    dataWrapper: {
        margin: 'auto',
        textAlign: 'center',
        fontSize: '100%',
        fontWeight: 500,
        // paddingTop: 10,
        marginTop: '10%',
        marginBottom: '10%',
        display: 'flex',
        justifyContent: 'center',
    },
    loading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '75%',
    },
    loadingIcon: {
        margin: 'auto',
        display: 'block',
    },
    leftContainer: {
        justifyContent: 'flex-start',
        // marginLeft: '5%',
        marginRight: '10%',
    },
    rightContainer: {
        justifyContent: 'flex-end',
        // marginLeft: '10%',
        marginRight: '5%',
    },
    dataBlock: {
        fontSize: '130%',
        // marginTop: '10%',
    },
    pieChart: {
        labels: {
            fill: 'black',
            fontSize: 18,
        },
        parent: { margin: 0 },
        data: {
            cursor: 'pointer',
        },
    },
};

function renderData(props) {
    const {
        data, totalErrors, totalRequestCounts, publishSelectedData, viewType, errorType, loading, themeName, classes,
    } = props;
    const localClass = {
        paper: {
            background: themeName === 'dark' ? '#152638' : '#E8E8E8',
            padding: '4%',
        },
        paperWrapper: {
            height: '75%',
            paddingTop: 35,
            margin: 'auto',
            width: '90%',
            textAlign: 'center',
        },
    };
    if (loading) {
        return (
            <div className={classes.loading}>
                <CircularProgress className={classes.loadingIcon} />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div style={localClass.paperWrapper}>
                <Paper
                    elevation={1}
                    style={localClass.paper}
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
                            defaultMessage='No data available for the selected options'
                        />
                    </Typography>
                </Paper>
            </div>
        );
    }
    const apiErrorsPerCent = totalRequestCounts === 0 ? '0.00' : ((totalErrors * 100) / totalRequestCounts).toFixed(2);
    const labelPrefix = viewType === ViewTypeEnum.API ? 'API' : 'App';
    return (
        <div>
            <TableRow>
                <TableCell component='th' scope='row'>
                    <VictoryPie
                        colorScale={colorScale}
                        data={data}
                        style={styles.pieChart}
                        innerRadius={80}
                        theme={VictoryTheme.material}
                        labelComponent={(
                            <VictoryTooltip
                                text={
                                    e => [labelPrefix + ': ' + e.datum.x,
                                        'Errors: ' + e.datum.y,
                                        'Percentage: ' + ((e.datum.y * 100) / totalRequestCounts).toFixed(2) + '%']}
                                orientation='top'
                                flyoutStyle={classes.flyOut}
                            />
                        )}
                        groupComponent={<VictoryClipContainer clipId={0} />}
                        events={[{
                            target: 'data',
                            eventHandlers: {
                                onClick: (e, clickedProps) => {
                                    let selected;
                                    if (viewType === 'app') {
                                        const vals = clickedProps.datum.x.split(' ');
                                        selected = { name: vals[0], owner: vals[2] };
                                    } else {
                                        selected = clickedProps.datum.x;
                                    }
                                    const message = {
                                        viewType, errorType, selected,
                                    };
                                    publishSelectedData(message);
                                },
                            },
                        }]}
                    />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell component='th' scope='row'>
                    <div className={classes.dataWrapper}>
                        <div className={classes.leftContainer}>
                            <FormattedMessage
                                id='error.count'
                                defaultMessage='No of Errors'
                            />
                            <div className={classes.dataBlock}>{totalErrors}</div>
                        </div>
                        <div className={classes.rightContainer}>
                            <FormattedMessage
                                id='error.percentage'
                                defaultMessage='Error Percentage'
                            />
                            <div className={classes.dataBlock}>
                                {apiErrorsPerCent}
                                {' '}
                                {'%'}
                            </div>
                        </div>
                    </div>
                </TableCell>
            </TableRow>
        </div>
    );
}

function SummaryPieChart(props) {
    const { heading, classes } = props;
    return (
        <div>
            <Table className={classes.table}>
                <TableBody>
                    <TableRow>
                        <TableCell className={classes.header}>
                            <h3>{heading}</h3>
                        </TableCell>
                    </TableRow>
                    { renderData(props) }
                </TableBody>
            </Table>
        </div>
    );
}

export default withStyles(styles)(SummaryPieChart);

SummaryPieChart.propTypes = {
    heading: PropTypes.string.isRequired,
    classes: PropTypes.func.isRequired,
};

renderData.propTypes = {
    data: PropTypes.instanceOf(Object).isRequired,
    totalErrors: PropTypes.number.isRequired,
    totalRequestCounts: PropTypes.number.isRequired,
    viewType: PropTypes.string.isRequired,
    errorType: PropTypes.string.isRequired,
    themeName: PropTypes.string.isRequired,
    publishSelectedData: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    classes: PropTypes.func.isRequired,
};

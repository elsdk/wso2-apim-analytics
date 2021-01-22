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
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { Scrollbars } from 'react-custom-scrollbars';
import CircularProgress from '@material-ui/core/CircularProgress';
import TrafficChart from './TrafficChart';

/**
 * React Component for Api Traffic By Version widget body
 * @param {any} props @inheritDoc
 * @returns {ReactElement} Render the Api Traffic By Version widget body
 */
export default function APIMApiTrafficByVersion(props) {
    const {
        themeName, usageData, handleLimitChange, limit, height, inProgress, setCurrentApi,
        apilist = [], apiSelected = '',
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
        inProgress: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height,
        },
        formControl: {
            marginTop: '2%',
            marginLeft: '5%',
            marginBottom: 20,
        },
        mainDiv: {
            backgroundColor: themeName === 'dark' ? '#0e1e33' : '#fff',
            padding: '20px',
        },
        h3: {
            margin: 'auto',
            textAlign: 'center',
            fontWeight: 'normal',
            letterSpacing: 1.5,
            paddingBottom: '10px',
            marginTop: 0,
        },
        formLabel: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            width: 150,
            display: 'block',
            overflow: 'hidden',
        },
    };
    return (
        <Scrollbars style={{ height }}>
            <div style={styles.mainDiv}>
                <div style={styles.headingWrapper}>
                    <h3 style={styles.h3}>
                        <FormattedMessage
                            id='widget.heading'
                            defaultMessage='API TRAFFIC BY VERSION'
                        />
                    </h3>
                </div>
                { inProgress ? (
                    <div style={styles.inProgress}>
                        <CircularProgress />
                    </div>
                ) : (
                    <div>
                        <FormControl style={styles.formControl}>
                            <Tooltip
                                placement='top'
                                title={<FormattedMessage id='limit' defaultMessage='Limit :' />}
                            >
                                <InputLabel
                                    shrink
                                    htmlFor='limit-number'
                                    style={styles.formLabel}
                                >
                                    <FormattedMessage
                                        id='limit'
                                        defaultMessage='Limit :'
                                    />
                                </InputLabel>
                            </Tooltip>
                            <Input
                                id='limit-number'
                                value={limit}
                                onChange={handleLimitChange}
                                type='number'
                                margin='normal'
                            />
                        </FormControl>
                        <FormControl style={styles.formControl}>
                            <InputLabel
                                shrink
                                htmlFor='apiSelected-label-placeholder'
                                style={styles.formLabel}
                            >
                                <FormattedMessage id='apiName.label' defaultMessage='API Name' />
                            </InputLabel>
                            <Select
                                value={apiSelected}
                                onChange={e => setCurrentApi(e.target.value)}
                                input={<Input name='apiSelected' id='apiSelected-label-placeholder' />}
                                displayEmpty
                                name='apiSelected'
                                style={styles.selectEmpty}
                            >
                                {
                                    apilist.map(option => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                        { usageData.length !== 0 ? (
                            <div>
                                <div style={styles.dataWrapper}>
                                    <TrafficChart
                                        data={usageData}
                                        themeName={themeName}
                                        // setCurrentApi={setCurrentApi}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div style={styles.paperWrapper}>
                                <Paper
                                    elevation={1}
                                    style={styles.paper}
                                >
                                    <Typography
                                        variant='h5'
                                        component='h3'
                                    >
                                        <FormattedMessage
                                            id='nodata.error.heading'
                                            defaultMessage='No Data Available !'
                                        />
                                    </Typography>
                                    <Typography component='p'>
                                        <FormattedMessage
                                            id='nodata.error.body'
                                            defaultMessage='No data available for the selected options!.'
                                        />
                                    </Typography>
                                </Paper>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Scrollbars>
    );
}

APIMApiTrafficByVersion.propTypes = {
    themeName: PropTypes.string.isRequired,
    usageData: PropTypes.instanceOf(Object).isRequired,
    handleLimitChange: PropTypes.func.isRequired,
    limit: PropTypes.string.isRequired,
    inProgress: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    setCurrentApi: PropTypes.func.isRequired,
    apilist: PropTypes.arrayOf(PropTypes.instanceOf(Object)).isRequired,
    apiSelected: PropTypes.string.isRequired,
};

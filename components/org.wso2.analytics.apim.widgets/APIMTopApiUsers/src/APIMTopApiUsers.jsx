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
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CustomTable from './CustomTable';

/**
 * React Component for Top Api Users widget body
 * @param {any} props @inheritDoc
 * @returns {ReactElement} Render the Top Api Users widget body
 */
function APIMTopApiUsers(props) {
    const {
        themeName, height, limit, userData, handleLimitChange, inProgress, intl, username,
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
    };
    const columns = [
        {
            id: 'user', numeric: false, disablePadding: false, label: 'table.heading.user',
        },
        {
            id: 'apiCalls', numeric: true, disablePadding: false, label: 'table.heading.apiCalls',
        },
    ];
    const strColumns = columns.map((colObj) => {
        return intl.formatMessage({ id: colObj.label });
    });
    const title = intl.formatMessage({ id: 'widget.heading' });

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
                    <h3 style={styles.heading}>
                        <FormattedMessage id='widget.heading' defaultMessage='TOP API USERS' />
                    </h3>
                </div>
                <div style={styles.formWrapper}>
                    <form noValidate autoComplete='off'>
                        <TextField
                            id='limit-number'
                            label={<FormattedMessage id='limit' defaultMessage='Limit' />}
                            value={limit}
                            onChange={handleLimitChange}
                            type='number'
                            style={styles.formControl}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            margin='normal'
                        />
                    </form>
                </div>
                { inProgress ? (
                    <div style={styles.loading}>
                        <CircularProgress style={styles.loadingIcon} />
                    </div>
                ) : (
                    <div>
                        {
                            !userData || userData.length === 0 ? (
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
                                <CustomTable
                                    data={userData}
                                    columns={columns}
                                    strColumns={strColumns}
                                    title={title}
                                    username={username}
                                />
                            )}
                    </div>
                )}

            </div>
        </Scrollbars>
    );
}

APIMTopApiUsers.propTypes = {
    themeName: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    limit: PropTypes.string.isRequired,
    userData: PropTypes.instanceOf(Object).isRequired,
    handleLimitChange: PropTypes.func.isRequired,
    inProgress: PropTypes.bool.isRequired,
    intl: intlShape.isRequired,
    username: PropTypes.string.isRequired,
};

export default injectIntl(APIMTopApiUsers);

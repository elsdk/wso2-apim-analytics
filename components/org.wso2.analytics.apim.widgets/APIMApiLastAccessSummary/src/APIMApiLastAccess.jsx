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
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CustomTable from './CustomTable';

/**
 * React Component for Api Last Access Summary widget body
 * @param {any} props @inheritDoc
 * @returns {ReactElement} Render the Api Last Access Summary widget body
 */
function APIMApiLastAccess(props) {
    const {
        themeName, height, limit, apiCreatedBy, accessData, apiCreatedHandleChange, handleChange, inProgress, intl,
        username,
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
            marginBottom: '5%',
        },
        form: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        formControl: {
            marginLeft: '5%',
            marginTop: '5%',
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
            id: 'version', numeric: false, disablePadding: false, label: 'table.heading.version',
        },
        {
            id: 'context', numeric: false, disablePadding: false, label: 'table.heading.context',
        },
        {
            id: 'subscriber', numeric: false, disablePadding: false, label: 'table.heading.subscriber',
        },
        {
            id: 'lastaccess', numeric: true, disablePadding: false, label: 'table.heading.lastaccess',
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
                        <FormattedMessage id='widget.heading' defaultMessage='API LAST ACCESS SUMMARY' />
                    </h3>
                </div>
                <div style={styles.formWrapper}>
                    <form style={styles.form}>
                        <FormControl style={styles.formControl}>
                            <Tooltip
                                placement='top'
                                title={<FormattedMessage id='createdBy.label' defaultMessage='API Created By' />}
                            >
                                <InputLabel
                                    shrink
                                    htmlFor='api-createdBy-label-placeholder'
                                    style={styles.formLabel}
                                >
                                    <FormattedMessage id='createdBy.label' defaultMessage='API Created By' />
                                </InputLabel>
                            </Tooltip>
                            <Select
                                value={apiCreatedBy}
                                onChange={apiCreatedHandleChange}
                                input={<Input name='apiCreatedBy' id='api-createdBy-label-placeholder' />}
                                displayEmpty
                                name='apiCreatedBy'
                            >
                                <MenuItem value='All'>
                                    <FormattedMessage id='all.menuItem' defaultMessage='All' />
                                </MenuItem>
                                <MenuItem value='Me'>
                                    <FormattedMessage id='me.menuItem' defaultMessage='Me' />
                                </MenuItem>
                            </Select>
                        </FormControl>
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
                                    <FormattedMessage id='limit' defaultMessage='Limit :' />
                                </InputLabel>
                            </Tooltip>
                            <Input
                                id='limit-number'
                                value={limit}
                                onChange={handleChange}
                                type='number'
                                margin='normal'
                            />
                        </FormControl>
                    </form>
                </div>
                <div>
                    {
                        inProgress ? (
                            <div style={styles.loading}>
                                <CircularProgress style={styles.loadingIcon} />
                            </div>
                        ) : (
                            <div>
                                { !accessData || accessData.length === 0 ? (
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
                                        data={accessData}
                                        columns={columns}
                                        strColumns={strColumns}
                                        title={title}
                                        username={username}
                                    />
                                )}
                            </div>
                        )
                    }
                </div>
            </div>
        </Scrollbars>
    );
}

APIMApiLastAccess.propTypes = {
    themeName: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    limit: PropTypes.string.isRequired,
    apiCreatedBy: PropTypes.string.isRequired,
    accessData: PropTypes.instanceOf(Object).isRequired,
    apiCreatedHandleChange: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    inProgress: PropTypes.bool.isRequired,
    intl: intlShape.isRequired,
    username: PropTypes.string.isRequired,
};

export default injectIntl(APIMApiLastAccess);

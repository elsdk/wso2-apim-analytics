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
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { FormattedMessage } from 'react-intl';
import IntegrationReactSelect from '../../AppAndAPIErrorsByTime/src/IntegrationReactSelect';

const styles = theme => ({
    table: {
        minWidth: 650,
        maxWidth: 650,
        marginBottom: 50,
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
    formWrapper: {
        paddingTop: 10,
    },
    formControl: {
        marginLeft: 10,
        marginTop: 10,
        width: '10%',
    },
    formControlSelect: {
        paddingRight: 10,
        marginLeft: 10,
        marginTop: 10,
        minWidth: 200,
    },
    formLabel: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        width: '100%',
        display: 'block',
        overflow: 'hidden',
    },
});

function CustomFormGroup(props) {
    const {
        classes, selectedAPI, selectedVersion, selectedResource, apiList,
        versionList, operationList, selectedLimit, handleGraphQLOperationChange,
        handleAPIChange, handleVersionChange, handleOperationChange, handleLimitChange,
    } = props;
    const graphQLOps = ['MUTATION', 'QUERY', 'SUBSCRIPTION'];
    const graphQL = operationList.length > 0 && !!operationList.find(op => graphQLOps.includes(op.HTTP_METHOD));
    return (
        <div component={Paper}>
            <div className={classes.formWrapper}>
                <FormControl className={classes.formControlSelect}>
                    <IntegrationReactSelect
                        options={apiList}
                        value={selectedAPI}
                        onChange={handleAPIChange}
                        disabled={apiList && apiList.length === 0}
                        placeholder='All'
                        displayName='API :'
                        getLabel={item => item.API_NAME}
                        getValue={item => item.API_NAME}
                    />
                </FormControl>
                <FormControl className={classes.formControlSelect}>
                    <IntegrationReactSelect
                        options={versionList}
                        value={selectedVersion}
                        onChange={handleVersionChange}
                        placeholder='All'
                        displayName='Version :'
                        getLabel={item => item.API_VERSION}
                        getValue={item => item.API_ID}
                    />
                </FormControl>
                <FormControl className={classes.formControlSelect}>
                    <IntegrationReactSelect
                        isMulti={graphQL}
                        options={operationList}
                        value={selectedResource}
                        onChange={graphQL ? handleGraphQLOperationChange : handleOperationChange}
                        disabled={operationList && operationList.length === 0}
                        placeholder='All'
                        displayName='Operation :'
                        getLabel={item => item.URL_PATTERN + ' ( ' + item.HTTP_METHOD + ' )'}
                        getValue={item => item.URL_MAPPING_ID}
                    />
                </FormControl>
                <div>
                    <FormControl className={classes.formControl}>
                        <TextField
                            id='limit-number'
                            label={<FormattedMessage id='limit' defaultMessage='Limit' />}
                            value={selectedLimit}
                            onChange={handleLimitChange}
                            type='number'
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </FormControl>
                </div>
            </div>
        </div>
    );
}

CustomFormGroup.propTypes = {
    classes: PropTypes.instanceOf(Object).isRequired,
};

export default withStyles(styles)(CustomFormGroup);

CustomFormGroup.propTypes = {
    classes: PropTypes.func.isRequired,
    handleAPIChange: PropTypes.func.isRequired,
    handleVersionChange: PropTypes.func.isRequired,
    handleOperationChange: PropTypes.func.isRequired,
    handleGraphQLOperationChange: PropTypes.func.isRequired,
    handleLimitChange: PropTypes.func.isRequired,
    selectedAPI: PropTypes.number.isRequired,
    selectedVersion: PropTypes.number.isRequired,
    selectedResource: PropTypes.number.isRequired,
    selectedLimit: PropTypes.number.isRequired,
    apiList: PropTypes.instanceOf(Object).isRequired,
    versionList: PropTypes.instanceOf(Object).isRequired,
    operationList: PropTypes.instanceOf(Object).isRequired,
};

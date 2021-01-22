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
import { ViewTypeEnum, DrillDownEnum } from './Constants';
import IntegrationReactSelect from '../../AppAndAPIErrorsByTime/src/IntegrationReactSelect';

const styles = theme => ({
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
    },
    autoSelectForm: {
        margin: theme.spacing.unit,
        minWidth: 200,
    },
});

function CustomFormGroup(props) {
    const {
        classes, viewType, drillDownType, selectedApp, selectedAPI, selectedVersion, selectedResource, apiList, appList,
        versionList, operationList, selectedLimit, handleGraphQLOperationChange,
        handleApplicationChange, handleAPIChange, handleVersionChange, handleOperationChange, handleLimitChange,
    } = props;
    const graphQLOps = ['MUTATION', 'QUERY', 'SUBSCRIPTION'];
    const graphQL = operationList.length > 0 && !!operationList.find(op => graphQLOps.includes(op.HTTP_METHOD));
    let filteredAPIList = apiList;
    if (drillDownType === DrillDownEnum.RESOURCE) {
        filteredAPIList = apiList.filter(item => item.API_TYPE !== 'WS');
    }
    return (
        <div component={Paper}>
            <div>
                { viewType === ViewTypeEnum.APP ? (
                    <FormControl className={classes.autoSelectForm}>
                        <IntegrationReactSelect
                            options={appList}
                            value={selectedApp}
                            onChange={handleApplicationChange}
                            disabled={appList && appList.length === 0}
                            placeholder='All'
                            displayName='Application :'
                            getLabel={item => item.NAME + ' ( ' + item.CREATED_BY + ' )'}
                            getValue={item => item.APPLICATION_ID}
                        />
                    </FormControl>
                ) : '' }

                <FormControl className={classes.autoSelectForm}>
                    <IntegrationReactSelect
                        options={filteredAPIList}
                        value={selectedAPI}
                        onChange={handleAPIChange}
                        disabled={filteredAPIList && filteredAPIList.length === 0}
                        placeholder='All'
                        displayName='API :'
                        getLabel={item => item.API_NAME}
                        getValue={item => item.API_NAME}
                    />
                </FormControl>

                { drillDownType === DrillDownEnum.VERSION || drillDownType === DrillDownEnum.RESOURCE ? (
                    <FormControl className={classes.autoSelectForm}>
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
                ) : '' }

                { drillDownType === DrillDownEnum.RESOURCE
                && (
                    <FormControl className={classes.autoSelectForm}>
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
                )}

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
    handleApplicationChange: PropTypes.func.isRequired,
    handleAPIChange: PropTypes.func.isRequired,
    handleVersionChange: PropTypes.func.isRequired,
    handleOperationChange: PropTypes.func.isRequired,
    handleGraphQLOperationChange: PropTypes.func.isRequired,
    handleLimitChange: PropTypes.func.isRequired,
    selectedApp: PropTypes.number.isRequired,
    selectedAPI: PropTypes.number.isRequired,
    selectedVersion: PropTypes.number.isRequired,
    selectedResource: PropTypes.number.isRequired,
    selectedLimit: PropTypes.number.isRequired,
    apiList: PropTypes.instanceOf(Object).isRequired,
    appList: PropTypes.instanceOf(Object).isRequired,
    versionList: PropTypes.instanceOf(Object).isRequired,
    operationList: PropTypes.instanceOf(Object).isRequired,
    viewType: PropTypes.string.isRequired,
    drillDownType: PropTypes.string.isRequired,
};

export default withStyles(styles)(CustomFormGroup);

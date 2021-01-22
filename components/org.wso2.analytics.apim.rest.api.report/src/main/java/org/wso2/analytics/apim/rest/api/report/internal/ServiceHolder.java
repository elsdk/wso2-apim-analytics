/*
* Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
package org.wso2.analytics.apim.rest.api.report.internal;

import org.wso2.carbon.analytics.idp.client.core.api.IdPClient;
import org.wso2.carbon.config.provider.ConfigProvider;

import java.lang.reflect.Constructor;

/**
 *  Service Holder class for Report component.
 */
public class ServiceHolder {

    private IdPClient apimAdminClient;
    private static ServiceHolder instance = new ServiceHolder();
    private  ConfigProvider configProvider;
    private Constructor<?> reportImplClassConstructor;

    private ServiceHolder() {
    }

    public Constructor getReportImplClassConstructor() {

        return reportImplClassConstructor;
    }

    public void setReportImplClassConstructor(Constructor reportImplClassConstructor) {

        this.reportImplClassConstructor = reportImplClassConstructor;
    }

    public void setAPIMAdminClient(IdPClient service) {
        this.apimAdminClient = service;
    }

    public IdPClient getApimAdminClient() {
        return apimAdminClient;
    }

    public static ServiceHolder getInstance() {
        return instance;
    }

    public void setConfigProvider(ConfigProvider configProvider) {

        this.configProvider = configProvider;
    }

    public ConfigProvider getConfigProvider() {

        return configProvider;
    }



}

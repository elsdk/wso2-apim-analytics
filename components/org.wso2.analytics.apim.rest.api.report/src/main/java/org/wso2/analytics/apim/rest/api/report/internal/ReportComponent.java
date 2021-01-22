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

import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.analytics.idp.client.core.api.IdPClient;
import org.wso2.carbon.config.ConfigurationException;
import org.wso2.carbon.config.provider.ConfigProvider;

import java.lang.reflect.Constructor;
import java.util.LinkedHashMap;

/**
 * Service component to get Carbon Config Provider OSGi service.
 */
@Component(
        name = "org.wso2.analytics.apim.rest.api.report.internal.ReportComponent",
        immediate = true
)
public class ReportComponent {

    private static final Logger log = LoggerFactory.getLogger(ReportComponent.class);

    @Activate
    protected void activate(BundleContext bundleContext) {
        log.debug("activating ReportComponent bundle");
        ConfigProvider configProvider = ServiceHolder.getInstance().getConfigProvider();
        try {
            LinkedHashMap<String, String> reportConfigs = (LinkedHashMap<String, String>) configProvider.
                    getConfigurationObject("report");
            if (reportConfigs != null) {
                String implClass = reportConfigs.get("implClass");
                Class<?> reportGeneratorClass = Class.forName(implClass);
                Constructor<?> constructor = reportGeneratorClass.
                        getDeclaredConstructor(String.class, String.class, String.class);
                ServiceHolder.getInstance().setReportImplClassConstructor(constructor);
            }
        } catch (ConfigurationException | ClassNotFoundException | NoSuchMethodException e) {
            log.error("Error during activating ReportComponent.", e);
        }
    }

    @Deactivate
    protected void deactivate() {
    }

    @Reference(
            name = "IdPClient",
            service = IdPClient.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unregisterIdP"
    )
    protected void registerIdP(IdPClient client) {
        ServiceHolder.getInstance().setAPIMAdminClient(client);
    }

    protected void unregisterIdP(IdPClient client) {
        ServiceHolder.getInstance().setAPIMAdminClient(null);
    }

    @Reference(service = ConfigProvider.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unregisterConfigProvider")
    protected void registerConfigProvider(ConfigProvider client) {
        ServiceHolder.getInstance().setConfigProvider(client);
    }

    protected void unregisterConfigProvider(ConfigProvider client) {
        ServiceHolder.getInstance().setConfigProvider(null);
    }

}

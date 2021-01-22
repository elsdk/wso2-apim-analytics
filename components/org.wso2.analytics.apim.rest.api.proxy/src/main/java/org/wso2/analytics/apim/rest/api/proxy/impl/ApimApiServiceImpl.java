/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
package org.wso2.analytics.apim.rest.api.proxy.impl;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import feign.gson.GsonDecoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.analytics.apim.rest.api.proxy.APIMServiceStubs;
import org.wso2.analytics.apim.rest.api.proxy.ApimApiService;
import org.wso2.analytics.apim.rest.api.proxy.NotFoundException;
import org.wso2.analytics.apim.rest.api.proxy.Util;
import org.wso2.analytics.apim.rest.api.proxy.dto.APIInfoDTO;
import org.wso2.analytics.apim.rest.api.proxy.dto.APIListDTO;
import org.wso2.analytics.apim.rest.api.proxy.dto.ApplicationListDTO;
import org.wso2.analytics.apim.rest.api.proxy.dto.ManagerVerificationInfoDTO;
import org.wso2.analytics.apim.rest.api.proxy.internal.ServiceHolder;
import org.wso2.carbon.analytics.idp.client.core.api.AnalyticsHttpClientBuilderService;
import org.wso2.carbon.analytics.idp.client.core.exception.IdPClientException;
import org.wso2.carbon.analytics.idp.client.external.dto.OAuth2IntrospectionResponse;
import org.wso2.carbon.analytics.idp.client.external.impl.OAuth2ServiceStubs;
import org.wso2.carbon.config.ConfigurationException;
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.msf4j.Request;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import javax.ws.rs.core.Response;

/**
 * Proxy service for APIM REST APIs.
 */
public class ApimApiServiceImpl extends ApimApiService {
    private OAuth2ServiceStubs oAuth2ServiceStubs;
    private static final String AM_COOKIE_P1 = "SDID";
    private static final String AM_COOKIE_P2 = "HID=";
    private static final String AUTH_CONFIGS = "auth.configs";
    private static final String CONNECTION_TIMEOUT = "connectionTimeout";
    private static final String COOKIE = "Cookie";
    private static final String DASHBOARD_USER = "DASHBOARD_USER=";
    private static final String DEFAULT_KM_USERNAME = "admin";
    private static final String DEFAULT_KM_PASSWORD = "admin";
    private static final String DEFAULT_CONNECTION_TIMEOUT = "10000";
    private static final String DEFAULT_KM_TOKEN_URL = "https://localhost:9443/oauth2";
    private static final String DEFAULT_READ_TIMEOUT = "60000";
    private static final String DEV_PORTAL_URL = "devPortalUrl";
    private static final String ENDPOINT = "{serverUrl}/api/am/{serverName}/v1";
    private static final String KM_PASSWORD = "kmPassword";
    private static final String KM_TOKEN_URL = "kmTokenUrl";
    private static final String KM_USERNAME = "kmUsername";
    private static final String INTROSPECT_POSTFIX = "/introspect";
    private static final String INTROSPECTION_URL = "introspectionUrl";
    private static final String PROPERTIES = "properties";
    private static final String PUBLISHER = "publisher";
    private static final String PUBLISHER_URL = "publisherUrl";
    private static final String READ_TIMEOUT = "readTimeout";
    private static final String SCOPE_MONITORING_DASHBOARD = "apim_analytics:monitoring_dashboard";
    private static final String SCOPE_MANAGER_DASHBOARD = "apim_analytics:business_analytics";
    private static final String SERVER_NAME_TEMPLATE = "{serverName}";
    private static final String SERVER_URL_TEMPLATE = "{serverUrl}";
    private static final String STORE = "store";
    private static final String TOKEN_POSTFIX = "/token";
    private static final String REVOKE_POSTFIX = "/revoke";
    private final Util util = new Util();
    private static final Logger log = LoggerFactory.getLogger(ApimApiServiceImpl.class);

    /**
     * Retrieve the list of APIs from APIM Publisher.
     *
     * @param request request to retrieve APIs list
     * @return list of APIs
     * @throws NotFoundException if the requested resource is not found
     */
    @Override
    public Response apimApisGet(Request request) throws NotFoundException {
        try {
            String publisherUrl = getServerURL(PUBLISHER);

            if (publisherUrl != null) {
                String publisherEndpoint = ENDPOINT.replace(SERVER_URL_TEMPLATE, publisherUrl)
                        .replace(SERVER_NAME_TEMPLATE, PUBLISHER);
                APIMServiceStubs serviceStubs = new APIMServiceStubs(publisherEndpoint, null);
                String authToken = getAccessToken(request.getHeader(COOKIE));
                feign.Response responseOfApiList = serviceStubs.getPublisherServiceStub().getApis(authToken);

                APIListDTO aggregatedList = new APIListDTO();

                if (responseOfApiList.status() == 200) {
                    APIListDTO apisDetails = (APIListDTO) new GsonDecoder().decode(responseOfApiList, APIListDTO.class);
                    aggregatedList.setList(apisDetails.getList());
                } else {
                    log.error("Unable to retrieve API list via publisher API. Response status :" ,
                            responseOfApiList.status());
                }
                responseOfApiList.close();

                feign.Response responseOfProductList = serviceStubs.getPublisherServiceStub().
                        getApiProducts(authToken);
                if (responseOfProductList.status() == 200) {
                    APIListDTO productDetails = (APIListDTO) new GsonDecoder().decode(responseOfProductList,
                            APIListDTO.class);
                    for (APIInfoDTO apiInfoDTO : productDetails.getList()) {
                        aggregatedList.addListItem(apiInfoDTO);
                    }
                } else {
                    log.error("Unable to retrieve API Product list via publisher API. Response status :" ,
                            responseOfProductList.status());
                }
                responseOfProductList.close();
                if (responseOfApiList.status() == 200 || responseOfProductList.status() == 200) {
                    return Response.status(200).entity(aggregatedList).build(); // return the aggregated list
                }
                util.handleInternalServerError("Unable to retrieve API/Products list.");
            } else {
                util.handleBadRequest("Unable to find Publisher server URL.");
            }
        } catch (ConfigurationException e) {
            util.handleInternalServerError("Error occurred while retrieving Publisher server URL.", e);
        } catch (IOException e) {
            util.handleInternalServerError("Error occurred while processing server response.", e);
        }
        return null;
    }

    /**
     * Retrieve the list of applications from APIM Store.
     *
     * @param request request to retrieve applications list
     * @return the list of applications
     * @throws NotFoundException if the requested resource is not found
     */
    @Override
    public Response apimApplicationsGet(Request request) throws NotFoundException {
        try {
            String storeUrl = getServerURL(STORE);

            if (storeUrl != null) {
                String storeEndpoint = ENDPOINT.replace(SERVER_URL_TEMPLATE, storeUrl)
                        .replace(SERVER_NAME_TEMPLATE, STORE);
                APIMServiceStubs serviceStubs = new APIMServiceStubs(null, storeEndpoint);
                String authToken = getAccessToken(request.getHeader(COOKIE));
                feign.Response response = serviceStubs.getStoreServiceStub().getApplications(authToken);

                if (response.status() == 200) {
                    ApplicationListDTO appDetails =
                            (ApplicationListDTO) new GsonDecoder().decode(response, ApplicationListDTO.class);
                    int status = response.status();
                    response.close();
                    return Response.status(status).entity(appDetails).build();
                }
                response.close();
                util.handleInternalServerError("Unable to retrieve Application list.");
            } else {
                util.handleBadRequest("Unable to find Developer Portal server URL.");
            }
        } catch (ConfigurationException e) {
            util.handleInternalServerError("Error occurred while retrieving Developer Portal server URL.", e);
        } catch (IOException e) {
            util.handleInternalServerError("Error occurred while processing server response.", e);
        }
        return null;
    }

    @Override
    public Response apimIsManagerGet(Request request) throws NotFoundException {
        String authToken = getAccessToken(request.getHeader(COOKIE));
        try {
            OAuth2ServiceStubs oAuth2Stub = getOAuth2ServiceStubs();
            feign.Response introspectTokenResponse = oAuth2Stub.getIntrospectionServiceStub()
                    .introspectAccessToken(authToken);
            if (introspectTokenResponse == null) {
                util.handleInternalServerError("Error occurred while introspecting token. Response is null.");
            }
            if (introspectTokenResponse.status() == 200) {   //200 - Success
                OAuth2IntrospectionResponse introspectResponse = (OAuth2IntrospectionResponse) new GsonDecoder()
                        .decode(introspectTokenResponse, OAuth2IntrospectionResponse.class);
                String scopes = introspectResponse.getScope();
                if (scopes != null) {
                    ManagerVerificationInfoDTO managerVerificationInfoDTO = new ManagerVerificationInfoDTO();
                    managerVerificationInfoDTO.setUsername(introspectResponse.getUsername());
                    if (scopes.contains(SCOPE_MONITORING_DASHBOARD)
                            || scopes.contains(SCOPE_MANAGER_DASHBOARD)) {
                        managerVerificationInfoDTO.setIsManager(true);
                    } else {
                        managerVerificationInfoDTO.setIsManager(false);
                    }
                    introspectTokenResponse.close();
                    return Response.status(introspectTokenResponse.status()).entity(managerVerificationInfoDTO).build();
                } else {
                    util.handleInternalServerError("Token introspection failed to return user scopes.");
                }
            }
            introspectTokenResponse.close();
            util.handleInternalServerError("Unable to retrieve scopes from token introspection." +
                    " Response code:" + introspectTokenResponse.status());
        } catch (ConfigurationException e) {
            util.handleInternalServerError("Error occurred while retrieving key manager configuration.", e);
        } catch (IdPClientException | IOException e) {
            util.handleInternalServerError("Error occurred while introspecting the access token.", e);
        }
        return null;
    }

    /**
     * Retrieve the server url from the deployment file.
     *
     * @param serverName the name of the server, i.e. Publisher/Store
     * @return server URL of the requested endpoint
     * @throws ConfigurationException if an error occurs while retrieving configuration
     */
    private String getServerURL(String serverName) throws ConfigurationException {
        ConfigProvider configProvider = ServiceHolder.getInstance().getConfigProvider();
        LinkedHashMap authConfig = (LinkedHashMap) configProvider.getConfigurationObject(AUTH_CONFIGS);

        if (authConfig != null) {
            LinkedHashMap properties = (LinkedHashMap) authConfig.get(PROPERTIES);
            if (properties != null) {
                if (serverName.equalsIgnoreCase(PUBLISHER)) {
                    return (String) properties.get(PUBLISHER_URL);
                } else {
                    if (properties.get(DEV_PORTAL_URL) != null) {
                        return (String) properties.get(DEV_PORTAL_URL);
                    } else {
                        return (String) properties.get(PUBLISHER_URL);
                    }
                }
            }
        }
        return null;
    }

    /**
     * Construct the access token from cookies.
     *
     * @param cookies cookies string received with the request
     * @return the access token
     */
    private String getAccessToken(String cookies) {
        List<String> cookieList = Arrays.asList(cookies.split(";"));
        String accessTokenP1 = "";
        String accessTokenP2 = "";

        for (String cookie : cookieList) {
            if (cookie.contains(DASHBOARD_USER)) {
                String userDTO = cookie.replace(DASHBOARD_USER, "");
                JsonObject jsonUserDto = new Gson().fromJson(userDTO, JsonObject.class);
                JsonElement element = jsonUserDto.get(AM_COOKIE_P1);
                if (element != null) {
                    accessTokenP1 = element.getAsString();
                }
            } else if (cookie.contains(AM_COOKIE_P2)) {
                accessTokenP2 = cookie.replace(AM_COOKIE_P2, "").trim();
            }
        }

        return accessTokenP1 + accessTokenP2;
    }

    /**
     * Get OAuth2ServiceStubs instance
     *
     * @return the an OAuth2ServiceStubs instance
     */
    private OAuth2ServiceStubs getOAuth2ServiceStubs() throws ConfigurationException {
        if (oAuth2ServiceStubs != null) {
            return oAuth2ServiceStubs;
        } else {
            HashMap<String, String> kmConfig = getKmConfig();
            if (kmConfig != null) {
                AnalyticsHttpClientBuilderService analyticsHttpClientBuilderService =
                        ServiceHolder.getInstance().getAnalyticsHttpClientBuilderService();
                oAuth2ServiceStubs = new OAuth2ServiceStubs(
                        analyticsHttpClientBuilderService, kmConfig.get(KM_TOKEN_URL) + TOKEN_POSTFIX,
                        kmConfig.get(KM_TOKEN_URL) + REVOKE_POSTFIX, kmConfig.get(INTROSPECTION_URL),
                        kmConfig.get(KM_USERNAME), kmConfig.get(KM_PASSWORD),
                        Integer.parseInt(kmConfig.get(CONNECTION_TIMEOUT)),
                        Integer.parseInt(kmConfig.get(READ_TIMEOUT)));
                return oAuth2ServiceStubs;
            } else {
                util.handleInternalServerError("Unable to retrieve key manager configuration");
            }
        }
        return null;
    }

    /**
     * Get key manager configuration from auth.configs
     *
     * @return the an key manager configuration
     */
    private HashMap getKmConfig() throws ConfigurationException {
        ConfigProvider configProvider = ServiceHolder.getInstance().getConfigProvider();
        LinkedHashMap authConfig = (LinkedHashMap) configProvider.getConfigurationObject(AUTH_CONFIGS);

        if (authConfig != null) {
            LinkedHashMap<String, String> properties = (LinkedHashMap) authConfig.get(PROPERTIES);
            if (properties != null) {
                String kmTokenUrl = properties.getOrDefault(KM_TOKEN_URL, DEFAULT_KM_TOKEN_URL);
                String introspectionUrl = properties.getOrDefault(INTROSPECTION_URL,
                        kmTokenUrl + INTROSPECT_POSTFIX);
                String kmUsername = properties.getOrDefault(KM_USERNAME, DEFAULT_KM_USERNAME);
                String kmPassword = properties.getOrDefault(KM_PASSWORD, DEFAULT_KM_PASSWORD);
                String connectionTimeout = properties.getOrDefault(CONNECTION_TIMEOUT, DEFAULT_CONNECTION_TIMEOUT);
                String readTimeout = properties.getOrDefault(READ_TIMEOUT, DEFAULT_READ_TIMEOUT);

                HashMap<String, String> kmConfig = new HashMap<>();
                kmConfig.put(KM_TOKEN_URL, kmTokenUrl);
                kmConfig.put(INTROSPECTION_URL, introspectionUrl);
                kmConfig.put(KM_USERNAME, kmUsername);
                kmConfig.put(KM_PASSWORD, kmPassword);
                kmConfig.put(CONNECTION_TIMEOUT, connectionTimeout);
                kmConfig.put(READ_TIMEOUT, readTimeout);
                return kmConfig;
            }
        }
        return null;
    }
}


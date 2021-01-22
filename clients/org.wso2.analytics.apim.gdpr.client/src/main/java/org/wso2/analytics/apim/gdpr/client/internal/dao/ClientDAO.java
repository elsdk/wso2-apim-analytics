/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.wso2.analytics.apim.gdpr.client.internal.dao;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.analytics.apim.gdpr.client.exceptions.GDPRClientException;
import org.wso2.analytics.apim.gdpr.client.internal.util.QueryManager;
import org.wso2.carbon.database.query.manager.config.Queries;
import org.wso2.carbon.database.query.manager.exception.QueryMappingNotAvailableException;
import org.wso2.carbon.datasource.core.api.DataSourceService;
import org.wso2.carbon.datasource.core.exception.DataSourceException;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import javax.sql.DataSource;

import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.COLUMN_NAME_PLACEHOLDER;
import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.CURRENT_IP_USERNAME_VALUE_PLACEHOLDER;
import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.CURRENT_IP_VALUE_PLACEHOLDER;
import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.CURRENT_VALUE_PLACEHOLDER;
import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.IP_AND_USERNAME_UPDATE_QUERY;
import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.IP_COLUMN_NAME_PLACEHOLDER;
import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.IP_PSEUDONYM_VALUE_PLACEHOLDER;
import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.IP_USERNAME_COLUMN_NAME_PLACEHOLDER;
import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.LIKE_VALUE_PLACEHOLDER;
import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.PSEUDONYM_VALUE_PLACEHOLDER;
import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.REPLACE_AND_UPDATE_QUERY;
import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.REPLACE_EMAIL_AND_UPDATE_QUERY;
import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.REPLACE_VALUE_PLACEHOLDER;
import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.TABLE_CHECK_QUERY;
import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.TABLE_NAME_PLACEHOLDER;
import static org.wso2.analytics.apim.gdpr.client.GDPRClientConstants.UPDATE_QUERY;

/**
 * DAO class for GDPR Client.
 */
public class ClientDAO {
    private static final Logger LOG = LoggerFactory.getLogger(ClientDAO.class);

    private DataSourceService dataSourceService;
    private QueryManager queryManager;
    private DataSource dataSource;
    private String databaseName;
    private Connection connection;
    private List<Queries> deploymentQueries;

    public ClientDAO(DataSourceService dataSourceService, String databaseName, List<Queries> deploymentQueries) {
        this.dataSourceService = dataSourceService;
        this.databaseName = databaseName;
        this.deploymentQueries = deploymentQueries;
    }

    public void init() throws GDPRClientException {
        try {
            this.connection = getDataSource().getConnection();
            DatabaseMetaData databaseMetaData = connection.getMetaData();
            this.queryManager = new QueryManager(databaseMetaData.getDatabaseProductName(),
                    databaseMetaData.getDatabaseProductVersion(), this.deploymentQueries);
            connection.setAutoCommit(false);
        } catch (SQLException | IOException | QueryMappingNotAvailableException e) {
            closeConnection();
            throw new GDPRClientException("Error initializing connection.", e);
        }
    }

    /**
     * Method for checking whether or not the given table exists.
     *
     * @param tableName name of the table
     * @return true/false based on the table existence.
     */
    public boolean checkTableExists(String tableName) {
        String query = this.queryManager.getQuery(TABLE_CHECK_QUERY);
        query = query.replace(TABLE_NAME_PLACEHOLDER, tableName);
        try (PreparedStatement ps = this.connection.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {
            return true;
        } catch (SQLException e) {
            LOG.debug("Table '{}' assumed to not exist since its existence check query {} resulted in exception {}.",
                    tableName, query, e.getMessage());
            return false;
        }
    }

    /**
     * Updates the table entry with the provided pseudonym for the username or email.
     *
     * @param tableName name of the table
     * @param columnName name of the column which contains the username/email value in the table
     * @param currentValue current value for username or email
     * @param pseudonym pseudonym value which will be used to replace the username or email
     * @return boolean returns whether the update is successful
     * @throws GDPRClientException throws when an error occurred while performing update query
     */
    public boolean updateTableEntry(String tableName, String columnName, String currentValue, String pseudonym)
            throws GDPRClientException {
        boolean result;
        String query = this.queryManager.getQuery(UPDATE_QUERY);
        query = query.replace(TABLE_NAME_PLACEHOLDER, tableName)
                .replace(COLUMN_NAME_PLACEHOLDER, columnName)
                .replace(CURRENT_VALUE_PLACEHOLDER, currentValue)
                .replace(PSEUDONYM_VALUE_PLACEHOLDER, pseudonym);
        result = executeUpdateQuery(tableName, query);
        return result;
    }

    /**
     * Updates the table entry with the provided pseudonym for the IP address and the username.
     *
     * @param tableName name of the table
     * @param ipColumnName name of the column which contains the ip address in the table
     * @param usernameColumn name of the column which contains the username value in the table
     * @param currentIpValue current value stored for ip address
     * @param currentUsernameValue current value stored for the username
     * @param pseudonym pseudonym value which will be used to replace the username or email
     * @return boolean returns whether the update is successful
     * @throws GDPRClientException throws when an error occurred while performing update query
     */
    public boolean updateIPAndUsernameInTableEntry(String tableName, String ipColumnName, String usernameColumn,
                                                   String currentIpValue, String currentUsernameValue, String pseudonym,
                                                   String pseudonymWithTenantDomain) throws GDPRClientException {
        boolean result;
        String query = this.queryManager.getQuery(IP_AND_USERNAME_UPDATE_QUERY);
        query = query.replace(TABLE_NAME_PLACEHOLDER, tableName)
                .replace(IP_COLUMN_NAME_PLACEHOLDER, ipColumnName)
                .replace(IP_USERNAME_COLUMN_NAME_PLACEHOLDER, usernameColumn)
                .replace(CURRENT_IP_VALUE_PLACEHOLDER, currentIpValue)
                .replace(CURRENT_IP_USERNAME_VALUE_PLACEHOLDER, currentUsernameValue)
                .replace(IP_PSEUDONYM_VALUE_PLACEHOLDER, pseudonym)
                .replace(PSEUDONYM_VALUE_PLACEHOLDER, pseudonymWithTenantDomain);
        result = executeUpdateQuery(tableName, query);
        return result;
    }

    /**
     * Updates the table entry by performing a string replace for the provided value.
     * ex: If the email is included in an alert message, this method replaces the email in that message with the
     * provided pseudonym.
     *
     * @param tableName name of the table
     * @param columnName name of the column which contains the email value in the table
     * @param currentValue current value for email
     * @param pseudonym pseudonym value which will be used to replace the email
     * @param likeValue text which needs to used for the LIKE operator in the update query
     * @return boolean returns whether the update is successful
     * @throws GDPRClientException throws when an error occurred while performing update query
     */
    public boolean performStringReplaceAndUpdateEmailTableEntry(String tableName, String columnName,
                                                                String currentValue, String pseudonym,
                                                                String likeValue)
            throws GDPRClientException {
        boolean result;
        String query = this.queryManager.getQuery(REPLACE_EMAIL_AND_UPDATE_QUERY);
        query = query.replace(TABLE_NAME_PLACEHOLDER, tableName)
                .replace(COLUMN_NAME_PLACEHOLDER, columnName)
                .replace(CURRENT_VALUE_PLACEHOLDER, currentValue)
                .replace(PSEUDONYM_VALUE_PLACEHOLDER, pseudonym)
                .replace(LIKE_VALUE_PLACEHOLDER, likeValue);
        result = executeUpdateQuery(tableName, query);
        return result;
    }

    /**
     * Updates the table entry by performing a string replace for the provided current value with replace value.
     *
     * @param tableName name of the table
     * @param columnName name of the column which contains the current value string in the table
     * @param currentValue current value
     * @param replaceValue replace value
     * @return boolean returns whether the update is successful
     * @throws GDPRClientException throws when an error occurred while performing update query
     */
    public boolean performStringReplaceAndUpdateTableEntry(String tableName, String columnName, String currentValue,
                                                           String replaceValue) throws GDPRClientException {
        boolean result;
        String query = this.queryManager.getQuery(REPLACE_AND_UPDATE_QUERY);
        query = query.replace(TABLE_NAME_PLACEHOLDER, tableName)
                .replace(COLUMN_NAME_PLACEHOLDER, columnName)
                .replace(CURRENT_VALUE_PLACEHOLDER, currentValue)
                .replace(REPLACE_VALUE_PLACEHOLDER, replaceValue);
        result = executeUpdateQuery(tableName, query);
        return result;
    }

    public boolean executeUpdateQuery(String tableName, String query) throws GDPRClientException {
        boolean result;
        PreparedStatement ps = null;
        try {
            ps = this.connection.prepareStatement(query);
            if (LOG.isDebugEnabled()) {
                LOG.debug("Executing query: " + query);
            }
            int updatedTableEntries =  ps.executeUpdate();
            result = updatedTableEntries >= 1;
            LOG.info("Update query successfully executed by updating {} number of rows for table: {} in {} database.",
                    updatedTableEntries, tableName, this.databaseName);
        } catch (SQLException e) {
            throw new GDPRClientException("Error occurred while performing the update. [Query=" + query + "]", e);
        } finally {
            closeStatement(ps);
        }
        return result;
    }

    private DataSource getDataSource() throws GDPRClientException {
        if (this.dataSource != null) {
            return this.dataSource;
        }

        if (this.dataSourceService == null) {
            throw new GDPRClientException("Datasource service is null. Cannot retrieve datasource '"
                    + this.databaseName + "'.");
        }

        try {
            this.dataSource = (DataSource) this.dataSourceService.getDataSource(this.databaseName);
        } catch (DataSourceException e) {
            throw new GDPRClientException("Unable to retrieve the datasource: '" + this.databaseName + "'.", e);
        }
        return this.dataSource;
    }

    private void closeStatement(PreparedStatement preparedStatement) throws GDPRClientException {
        if (preparedStatement != null) {
            try {
                preparedStatement.close();
            } catch (SQLException e) {
                throw new GDPRClientException("Error occurred while closing the prepared statement.", e);
            }
        }

    }

    public void closeConnection() throws GDPRClientException {
        try {
            if (this.connection != null) {
                if (this.connection.isClosed()) {
                    LOG.warn("Database connection is already closed for database: {}.", this.databaseName);
                    return;
                }
                this.connection.close();
                LOG.info("Database connection closed for database: {}.", this.databaseName);
            }
        } catch (SQLException e) {
            throw new GDPRClientException("Error occurred while closing the database connection.", e);
        }
    }

    public void commitConnection() throws GDPRClientException {
        try {
            if (this.connection != null) {
                if (this.connection.isClosed()) {
                    LOG.warn("Database connection is closed for database: {}. " +
                            "Hence, cannot commit the connection.", this.databaseName);
                    return;
                }
                this.connection.commit();
                LOG.info("Database connection committed for database: {}.", this.databaseName);
            }
        } catch (SQLException e) {
            throw new GDPRClientException("Error occurred while committing the database connection.", e);
        }
    }

    public void rollbackConnection() throws GDPRClientException {
        try {
            if (this.connection != null) {
                if (this.connection.isClosed()) {
                    LOG.warn("Database connection is closed for database: {}. " +
                            "Hence, cannot rollback the connection.", this.databaseName);
                    return;
                }
                this.connection.rollback();
                LOG.warn("Database connection rolled back for database: {}.", this.databaseName);
            }
        } catch (SQLException e) {
            throw new GDPRClientException("Error occurred while rollback the database connection.", e);
        }
    }
}

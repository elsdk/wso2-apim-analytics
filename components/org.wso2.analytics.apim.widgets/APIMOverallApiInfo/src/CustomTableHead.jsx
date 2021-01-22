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
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import TableSortLabel from '@material-ui/core/TableSortLabel';

const styles = {
    resetPadding: {
        paddingRight: '56px',
    },
};

const rows = [
    {
        id: 'apiName', numeric: false, disablePadding: false, label: 'table.heading.apiname', rowSpan: 2, colSpan: 1,
    },
    {
        id: 'responseHits',
        numeric: true,
        disablePadding: false,
        label: 'table.heading.response',
        rowSpan: 1,
        colSpan: 3,
    },
    {
        id: 'faultCount',
        numeric: true,
        disablePadding: false,
        label: 'table.heading.errorFaulty',
        rowSpan: 2,
        colSpan: 1,
    },
    {
        id: 'throttledCount',
        numeric: true,
        disablePadding: false,
        label: 'table.heading.errorThrottled',
        rowSpan: 2,
        colSpan: 1,
    },
];

/**
 * Create React Component for Custom Table Head
 */
export default class CustomTableHead extends React.Component {
    createSortHandler = property => (event) => {
        const { onRequestSort } = this.props;
        onRequestSort(event, property);
    };

    /**
     * Render the Custom Table Head
     * @return {ReactElement} customTableHead
     */
    render() {
        const { order, orderBy } = this.props;

        return (
            <TableHead>
                <TableRow>
                    {rows.map((row) => {
                        return (
                            <TableCell
                                key={row.id}
                                numeric={row.numeric}
                                padding={row.disablePadding ? 'none' : 'default'}
                                sortDirection={orderBy === row.id ? order : false}
                                rowSpan={row.rowSpan}
                                colSpan={row.colSpan}
                                align={row.id === 'responseHits' ? 'center' : ''}
                            >
                                <Tooltip
                                    title={<FormattedMessage id='sort.label.title' defaultMessage='Sort' />}
                                    placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                                    enterDelay={300}
                                >
                                    <TableSortLabel
                                        active={orderBy === row.id}
                                        direction={order}
                                        onClick={this.createSortHandler(row.id)}
                                    >
                                        <FormattedMessage
                                            id={row.label}
                                            defaultMessage={row.label.split('table.heading.')[1].toUpperCase()}
                                        />
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                        );
                    }, this)}
                </TableRow>
                <TableRow>
                    <TableCell align='right' numeric>
                        <FormattedMessage id='table.column.2xx' defaultMessage='2xx' />
                    </TableCell>
                    <TableCell align='right' numeric>
                        <FormattedMessage id='table.column.4xx' defaultMessage='4xx' />
                    </TableCell>
                    <TableCell align='right' numeric style={styles.resetPadding}>
                        <FormattedMessage id='table.column.5xx' defaultMessage='5xx' />
                    </TableCell>
                </TableRow>
            </TableHead>
        );
    }
}

CustomTableHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
};

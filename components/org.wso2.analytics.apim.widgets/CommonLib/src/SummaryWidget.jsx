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

import { green } from '@material-ui/core/colors';
import { red } from '@material-ui/core/colors';
import { withStyles } from '@material-ui/core/styles';
import shortNumber from 'short-number';
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({

});

/**
 * Create React Component for Custom Table Toolbar
 */
function SummaryWidget(props) {
    const {
        themeName,
        lastWeekCount,
        thisWeekCount,
        negative,
        tooltip
    } = props;
    let diff = thisWeekCount - lastWeekCount;
    if (negative) {
        diff *= -1;
    }
    const diffColor = diff < 0 ? red[500] : green[500];
    let arrow = thisWeekCount > lastWeekCount ? '▲' : '▼';
    if(diff === 0) {
        arrow = '';
    }
    let percentLabel = '';
    if (lastWeekCount > 0) {
        const percentage = (Math.abs(diff) * 100) / lastWeekCount;
        percentLabel = ' (' + percentage.toFixed(2) + '%)';
    }

    return (
        <div
            style={{
                margin: 'auto',
                textAlign: 'center',
                fontSize: '450%',
                fontWeight: 500,
                color: themeName === 'dark' ? '#fff' : '#2571a7',
            }}
        >
            <span>{shortNumber(thisWeekCount)}</span>

            <Tooltip title={tooltip}>
                <div style={{ fontSize: 20, color: diffColor }}>
                    {arrow}
                    {shortNumber(Math.abs(diff))}
                    {percentLabel}
                </div>
            </Tooltip>

        </div>
    );
}

SummaryWidget.propTypes = {
};

export default withStyles(styles)(SummaryWidget);

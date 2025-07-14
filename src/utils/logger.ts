/* 
 * Copyright (C) 2025-present YouGo (https://github.com/youg-o)
 * This program is licensed under the GNU Affero General Public License v3.0.
 * You may redistribute it and/or modify it under the terms of the license.
 * 
 * Attribution must be given to the original author.
 * This program is distributed without any warranty; see the license for details.
 */

const LOG_PREFIX = '[HYM]';

const LOG_STYLES = {
    CORE: {
        context: '[Core]',
        color: '#c084fc'  // light purple
    },
    MEMBER_VIDEOS: {
        context: '[Member Videos]',
        color: '#8b5cf6'  // indigo
    }
} as const;

// Error color for all error logs
const ERROR_COLOR = '#F44336';  // Red

function createLogger(category: { context: string; color: string }) {
    return (message: string, ...args: any[]) => {
        console.log(
            `%c${LOG_PREFIX}${category.context} ${message}`,
            `color: ${category.color}`,
            ...args
        );
    };
}

// Create error logger function
function createErrorLogger(category: { context: string; color: string }) {
    return (message: string, ...args: any[]) => {
        console.log(
            `%c${LOG_PREFIX}${category.context} %c${message}`,
            `color: ${category.color}`,  // Keep category color for prefix
            `color: ${ERROR_COLOR}`,     // Red color for error message
            ...args
        );
    };
}

// Create standard loggers
export const coreLog = createLogger(LOG_STYLES.CORE);
export const coreErrorLog = createErrorLogger(LOG_STYLES.CORE);

export const memberVideosLog = createLogger(LOG_STYLES.MEMBER_VIDEOS);
export const memberVideosErrorLog = createErrorLogger(LOG_STYLES.MEMBER_VIDEOS);
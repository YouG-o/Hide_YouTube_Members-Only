/* 
 * Copyright (C) 2025-present YouGo (https://github.com/youg-o)
 * This program is licensed under the GNU Affero General Public License v3.0.
 * You may redistribute it and/or modify it under the terms of the license.
 * 
 * Attribution must be given to the original author.
 * This program is distributed without any warranty; see the license for details.
 */

import { coreLog, coreErrorLog, memberVideosErrorLog, memberVideosLog } from '../utils/logger';
import { loadExtensionSettings } from '../utils/settings';
import { ExtensionSettings } from '../types/types';
import { setupUrlObserver, setupVisibilityChangeListener } from './observers';


injectFetchInterceptor();
coreLog('Content script starting to load...');

export let currentSettings: ExtensionSettings | null = null;


function injectFetchInterceptor() {
    const script = document.createElement('script');
    script.src = browser.runtime.getURL('dist/content/script.js');
    document.documentElement.appendChild(script);
    script.remove();
}

// Initialize features based on settings
async function initializeFeatures() {
    currentSettings = await loadExtensionSettings();

    if(currentSettings?.hideMembersOnlyVideos.enabled){
        setupUrlObserver();
        setupVisibilityChangeListener();
    }
}

initializeFeatures().then(() => {
    coreLog('Content script loaded successfully.');
}).catch((error) => {
    coreErrorLog('Error loading content script:', error);
});

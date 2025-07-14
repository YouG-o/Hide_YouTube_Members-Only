/* 
 * Copyright (C) 2025-present YouGo (https://github.com/youg-o)
 * This program is licensed under the GNU Affero General Public License v3.0.
 * You may redistribute it and/or modify it under the terms of the license.
 * 
 * Attribution must be given to the original author.
 * This program is distributed without any warranty; see the license for details.
 */

import { coreLog } from '../utils/logger';
import { loadExtensionSettings } from '../utils/settings';
import { ExtensionSettings } from '../types/types';
import { setupUrlObserver, setupVisibilityChangeListener } from './observers';


coreLog('Content script starting to load...');

export let currentSettings: ExtensionSettings | null = null;

// Initialize features based on settings
async function initializeFeatures() {
    currentSettings = await loadExtensionSettings();

    if(currentSettings?.hideMembersOnlyVideos.enabled){
        setupUrlObserver();
        setupVisibilityChangeListener();
    }
}

// Start initialization
initializeFeatures();
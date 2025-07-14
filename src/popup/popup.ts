/* 
 * Copyright (C) 2025-present YouGo (https://github.com/youg-o)
 * This program is licensed under the GNU Affero General Public License v3.0.
 * You may redistribute it and/or modify it under the terms of the license.
 * 
 * Attribution must be given to the original author.
 * This program is distributed without any warranty; see the license for details.
 */

import { ExtensionSettings } from '../types/types';
import { loadExtensionSettings } from '../utils/settings';

/**
 * This file handles the popup UI interactions and saves settings to storage
 */

// DOM Elements
const hideMembersOnlyVideosFeature = document.getElementById('hideMembersOnlyVideosFeature') as HTMLInputElement;
const extensionVersionElement = document.getElementById('extensionVersion') as HTMLSpanElement;

/**
 * Display the extension version in the popup.
 */
function displayExtensionVersion() {
    if (extensionVersionElement) {
        const manifest = browser.runtime.getManifest();
        extensionVersionElement.textContent = manifest.version;
    }
}

/**
 * Load saved settings from storage and update the UI.
 */
async function loadSettings() {
    try {
        const settings = await loadExtensionSettings();
        if (settings.hideMembersOnlyVideos) {
            hideMembersOnlyVideosFeature.checked = settings.hideMembersOnlyVideos.enabled;
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

/**
 * Save the current settings to storage.
 */
async function saveSettings() {
    const settings: ExtensionSettings = {
        hideMembersOnlyVideos: {
            enabled: hideMembersOnlyVideosFeature.checked
        }
    };
    try {
        await browser.storage.local.set({ settings });
        updateActiveTabs(settings);
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
}

/**
 * Update all active YouTube tabs with new settings.
 */
async function updateActiveTabs(settings: ExtensionSettings) {
    const tabs = await browser.tabs.query({ url: '*://*.youtube.com/*' });
    for (const tab of tabs) {
        if (tab.id) {
            browser.tabs.sendMessage(tab.id, {
                action: 'updateSettings',
                settings: settings
            }).catch((error: unknown) => {
                console.error(`Failed to update tab ${tab.id}:`, error);
            });
        }
    }
}

/**
 * Initialize event listeners for the popup.
 */
function initEventListeners() {
    hideMembersOnlyVideosFeature.addEventListener('change', saveSettings);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    displayExtensionVersion();
    loadSettings();
    initEventListeners();
});
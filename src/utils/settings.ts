/* 
 * Copyright (C) 2025-present YouGo (https://github.com/youg-o)
 * This program is licensed under the GNU Affero General Public License v3.0.
 * You may redistribute it and/or modify it under the terms of the license.
 * 
 * Attribution must be given to the original author.
 * This program is distributed without any warranty; see the license for details.
 */

import { coreLog } from './logger';
import { ExtensionSettings } from '../types/types';
import { DEFAULT_SETTINGS } from '../config/constants';


/**
 * Ensures that user settings contain all properties from default settings
 * If a property is missing, it's added with the default value
 */
export function migrateSettings(userSettings: any, defaultSettings: any): any {
    // Create a deep copy to avoid modifying the original
    const settings = JSON.parse(JSON.stringify(userSettings));
    let hasChanges = false;
    
    // Check top level properties (features)
    for (const feature in defaultSettings) {
        if (!settings[feature]) {
            settings[feature] = defaultSettings[feature];
            coreLog(`Migration: Added missing feature ${feature}`);
            hasChanges = true;
            continue;
        }
        
        // Check properties inside each feature
        for (const prop in defaultSettings[feature]) {
            if (!(prop in settings[feature])) {
                settings[feature][prop] = defaultSettings[feature][prop];
                coreLog(`Migration: Added missing property ${prop} to ${feature}`);
                hasChanges = true;
            }
        }
    }
    
    // Save changes if needed
    if (hasChanges) {
        browser.storage.local.set({ settings }).catch((err: unknown) => {
            coreLog('Error saving migrated settings:', err);
        });
    }
    
    return settings;
}

/**
 * Load extension settings from storage with fallback to defaults
 * @returns Promise<ExtensionSettings> - The loaded or default settings
 */
export async function loadExtensionSettings(): Promise<ExtensionSettings> {
    try {
        const data = await browser.storage.local.get('settings');
        
        // If no settings, return defaults
        if (!data.settings) {
            return DEFAULT_SETTINGS;
        }
        
        // Migrate settings to ensure all required properties exist
        return migrateSettings(data.settings, DEFAULT_SETTINGS) as ExtensionSettings;
    } catch (error) {
        console.error('Failed to load extension settings, using defaults:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Save extension settings to storage
 * @param settings - The settings to save
 */
export async function saveExtensionSettings(settings: ExtensionSettings): Promise<void> {
    try {
        await browser.storage.local.set({ settings });
    } catch (error) {
        console.error('Failed to save extension settings:', error);
        throw error;
    }
}
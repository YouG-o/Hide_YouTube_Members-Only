/* 
 * Copyright (C) 2025-present YouGo (https://github.com/youg-o)
 * This program is licensed under the GNU Affero General Public License v3.0.
 * You may redistribute it and/or modify it under the terms of the license.
 * 
 * Attribution must be given to the original author.
 * This program is distributed without any warranty; see the license for details.
 */

import { coreLog } from "../utils/logger";
import { currentSettings } from "./index";
import { hideMembersOnlyVideos } from "./memberVideos/MemberVideos";


let homeObserver: MutationObserver | null = null;
let lastHomeRefresh = 0;
const THROTTLE_DELAY = 500;

async function pageVideosObserver() {
    cleanupPageVideosObserver();

    let pageName = null;
    if (window.location.pathname === '/') {
        pageName = 'Home';
    } else if (window.location.pathname === '/feed/subscriptions') {
        pageName = 'Subscriptions';
    } else if (window.location.pathname.includes('/@')) {
        pageName = 'Channel';
    } else if (window.location.pathname === '/feed/trending') {
        pageName = 'Trending';
    }
    coreLog(`Setting up ${pageName} page videos observer`);

    // Wait for the rich grid renderer to be present
    const grids = Array.from(document.querySelectorAll('#contents.ytd-rich-grid-renderer')) as HTMLElement[];

    if (grids.length === 0) {
        // Wait for the first grid to appear
        await new Promise<void>(resolve => {
            const observer = new MutationObserver(() => {
                const found = document.querySelector('#contents.ytd-rich-grid-renderer');
                if (found) {
                    observer.disconnect();
                    resolve();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    // Re-select all grids after potential waiting
    const allGrids = Array.from(document.querySelectorAll('#contents.ytd-rich-grid-renderer')) as HTMLElement[];

    // Observe each grid
    allGrids.forEach(grid => {
        hideMembersOnlyVideos();
        const observer = new MutationObserver(() => {
            const now = Date.now();
            if (now - lastHomeRefresh >= THROTTLE_DELAY) {
                coreLog(`${pageName} page mutation detected`);
                setTimeout(() => {
                    hideMembersOnlyVideos();
                }, 100);
                lastHomeRefresh = now;
            }
        });

        observer.observe(grid, {
            childList: true
        });
    });
};

function cleanupPageVideosObserver() {
    homeObserver?.disconnect();
    homeObserver = null;
    lastHomeRefresh = 0;
}

// URL OBSERVER -----------------------------------------------------------
export function setupUrlObserver() {
    coreLog('Setting up URL observer');    
    // --- Standard History API monitoring
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
        coreLog('pushState called with:', args);
        originalPushState.apply(this, args);
        handleUrlChange();
    };
    
    history.replaceState = function(...args) {
        coreLog('replaceState called with:', args);
        originalReplaceState.apply(this, args);
        handleUrlChange();
    };
    
    // --- Browser navigation (back/forward)
    window.addEventListener('popstate', () => {
        coreLog('popstate event triggered');
        handleUrlChange();
    });
    
    // --- YouTube's custom page data update event
    window.addEventListener('yt-page-data-updated', () => {
        coreLog('YouTube page data updated');
        handleUrlChange();
    });
    
    // --- YouTube's custom SPA navigation events
    /*
    window.addEventListener('yt-navigate-start', () => {
        coreLog('YouTube SPA navigation started');
        handleUrlChange();
        });
        */
       
       /*
       window.addEventListener('yt-navigate-finish', () => {
        coreLog('YouTube SPA navigation completed');
        handleUrlChange();
    */
}


function handleUrlChange() {
    //coreLog(`[URL] Current pathname:`, window.location.pathname);
    coreLog(`[URL] Full URL:`, window.location.href);
    
    // --- Check if URL contains patterns
    const isChannelPage = window.location.pathname.includes('/@');
    if (isChannelPage) {
        // --- Handle all new channel page types (videos, featured, shorts, etc.)
        coreLog(`[URL] Detected channel page`);
        currentSettings?.hideMembersOnlyVideos.enabled && pageVideosObserver();
        return;
    }
    
    switch(window.location.pathname) {
        case '/results': // --- Search page
        coreLog(`[URL] Detected search page`);
        break;
        case '/': // --- Home page
            coreLog(`[URL] Detected home page`);
            currentSettings?.hideMembersOnlyVideos.enabled && pageVideosObserver();
            break;        
        case '/feed/subscriptions': // --- Subscriptions page
            coreLog(`[URL] Detected subscriptions page`);
            currentSettings?.hideMembersOnlyVideos.enabled && pageVideosObserver();
            break;
        case '/feed/trending':  // --- Trending page
            coreLog(`[URL] Detected trending page`);
            currentSettings?.hideMembersOnlyVideos.enabled && pageVideosObserver();
            break;
        case '/feed/history':  // --- History page
            coreLog(`[URL] Detected history page`);
            break;
        case '/playlist':  // --- Playlist page
            coreLog(`[URL] Detected playlist page`);
            break;
        case '/watch': // --- Video page
            coreLog(`[URL] Detected video page`);
            break;
        case '/embed': // --- Embed video page
            coreLog(`[URL] Detected embed video page`);
            break;
    }
}


// --- Visibility change listener to refresh titles when tab becomes visible
let visibilityChangeListener: ((event: Event) => void) | null = null;

export function setupVisibilityChangeListener(): void {
    // Clean up existing listener first
    cleanupVisibilityChangeListener();
    
    coreLog('Setting up visibility change listener');
    
    visibilityChangeListener = () => {
        // Only execute when tab becomes visible again
        if (document.visibilityState === 'visible') {
            coreLog('Tab became visible, refreshing titles to fix potential duplicates');
            currentSettings?.hideMembersOnlyVideos.enabled && hideMembersOnlyVideos();
        }
    };
    
    // Add the event listener
    document.addEventListener('visibilitychange', visibilityChangeListener);
}

function cleanupVisibilityChangeListener(): void {
    if (visibilityChangeListener) {
        document.removeEventListener('visibilitychange', visibilityChangeListener);
        visibilityChangeListener = null;
    }
}
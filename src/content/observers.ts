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
import { waitForElement } from "../utils/dom";


let pageGridObservers: MutationObserver[] = [];
let pageGridParentObserver: MutationObserver | null = null;
let suggestedVideosObserver: MutationObserver | null = null;

const OBSERVERS_DEBOUNCE_MS = 100;

let pageVideosDebounceTimer: number | null = null;
let suggestedVideosDebounceTimer: number | null = null;


async function pageVideosObserver() {
    cleanupPageVideosObserver();

    let pageName: string = '';
    if (window.location.pathname === '/') {
        pageName = 'Home';
    } else if (window.location.pathname === '/feed/subscriptions') {
        pageName = 'Subscriptions';
    } else if (window.location.pathname.includes('/@')) {
        pageName = 'Channel';
    } else if (window.location.pathname === '/feed/trending') {
        pageName = 'Trending';
    } else {
        pageName = 'Unknown';
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

    const allGrids = Array.from(document.querySelectorAll('#contents.ytd-rich-grid-renderer')) as HTMLElement[];
    allGrids.forEach(grid => {
        hideMembersOnlyVideos();
        const observer = new MutationObserver(() => handleGridMutationDebounced(pageName));
        observer.observe(grid, {
            childList: true,
            attributes: true,
            characterData: true
        });
        pageGridObservers.push(observer);
    });

    // Add parent grid observer (useful when clicking on filters)
    const gridParent = document.querySelector('#primary > ytd-rich-grid-renderer') as HTMLElement | null;
    if (gridParent) {
        pageGridParentObserver = new MutationObserver(() => handleGridMutationDebounced(pageName));
        pageGridParentObserver.observe(gridParent, {
            attributes: true
        });
    }
}

// New debounced handler for grid mutations
function handleGridMutationDebounced(pageName: string) {
    if (pageVideosDebounceTimer !== null) {
        clearTimeout(pageVideosDebounceTimer);
    }
    pageVideosDebounceTimer = window.setTimeout(() => {
        coreLog(`${pageName} page mutation detected.`);
        hideMembersOnlyVideos();
        setTimeout(() => {
            hideMembersOnlyVideos();
        }, 650);
        pageVideosDebounceTimer = null;
    }, OBSERVERS_DEBOUNCE_MS);
}

function suggestedVidsObserver() {
    cleanupSuggestedVideosObserver();

    // Observer for recommended videos (side bar)
    waitForElement('#secondary-inner ytd-watch-next-secondary-results-renderer #items').then((contents) => {
        coreLog('Setting up recommended videos observer');
        
        hideMembersOnlyVideos();
        
        // Check if we need to observe deeper (when logged in)
        const itemSection = contents.querySelector('ytd-item-section-renderer');
        const targetElement = itemSection ? itemSection : contents;
        
        coreLog(`Observing: ${targetElement === contents ? '#items directly' : 'ytd-item-section-renderer inside #items'}`);
        
        suggestedVideosObserver = new MutationObserver(() => {
            if (suggestedVideosDebounceTimer !== null) {
                clearTimeout(suggestedVideosDebounceTimer);
            }
            suggestedVideosDebounceTimer = window.setTimeout(() => {
                coreLog('Recommended videos mutation debounced (side bar)');
                hideMembersOnlyVideos();
                suggestedVideosDebounceTimer = null;
            }, OBSERVERS_DEBOUNCE_MS);
        });
        
        suggestedVideosObserver.observe(targetElement, {
            childList: true,
            subtree: true
        });
    });
};

function cleanupPageVideosObserver() {
    pageGridObservers.forEach(observer => observer.disconnect());
    pageGridObservers = [];
    pageGridParentObserver?.disconnect();
    pageGridParentObserver = null;

    if (pageVideosDebounceTimer !== null) {
        clearTimeout(pageVideosDebounceTimer);
        pageVideosDebounceTimer = null;
    }
}

function cleanupSuggestedVideosObserver() {
    suggestedVideosObserver?.disconnect();
    suggestedVideosObserver = null;

    if (suggestedVideosDebounceTimer !== null) {
        clearTimeout(suggestedVideosDebounceTimer);
        suggestedVideosDebounceTimer = null;
    }
}

function observersCleanup() {
    coreLog('Cleaning up all observers');
    
    cleanupPageVideosObserver();
    cleanupSuggestedVideosObserver();
}

// URL OBSERVER -----------------------------------------------------------
let urlChangeDebounceTimer: number | null = null;
const URL_CHANGE_DEBOUNCE_MS = 250;


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

    // --- Ensure observers are initialized on full page load (not just SPA navigation)
    handleUrlChange();
    
}


function handleUrlChange() {
    // Clear existing debounce timer
    if (urlChangeDebounceTimer !== null) {
        clearTimeout(urlChangeDebounceTimer);
    }

    // Set new debounce timer
    urlChangeDebounceTimer = window.setTimeout(() => {
        handleUrlChangeInternal();
        urlChangeDebounceTimer = null;
    }, URL_CHANGE_DEBOUNCE_MS);
}

function handleUrlChangeInternal() {
    //coreLog(`[URL] Current pathname:`, window.location.pathname);
    coreLog(`[URL] Full URL:`, window.location.href);

    // --- Clean up existing observers
    observersCleanup();
    
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
            currentSettings?.hideMembersOnlyVideos.enabled && suggestedVidsObserver();
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
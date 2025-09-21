/* 
 * Copyright (C) 2025-present YouGo (https://github.com/youg-o)
 * This program is licensed under the GNU Affero General Public License v3.0.
 * You may redistribute it and/or modify it under the terms of the license.
 * 
 * Attribution must be given to the original author.
 * This program is distributed without any warranty; see the license for details.
 */

import { memberVideosLog, memberVideosErrorLog } from "../../utils/logger";


export function hideMembersOnlyVideos() {
    // Select all video grid items and recommended videos
    const videoItems = document.querySelectorAll('ytd-rich-grid-media, ytd-video-renderer, yt-lockup-view-model');
    let hiddenCount = 0;

    videoItems.forEach(item => {
        let shouldHide = false;

        // Look for the "Members only" badge in current format
        const membersBadge = item.querySelector('.badge-style-type-members-only');
        if (membersBadge) {
            shouldHide = true;
        }

        // Look for the "Members only" badge in recommended videos format (yt-lockup-view-model)
        const commerceBadge = item.querySelector('.yt-badge-shape--commerce');
        if (commerceBadge) {
            shouldHide = true;
        }

        if (shouldHide) {
            // For recommended videos (yt-lockup-view-model), hide the element directly
            // For grid videos, hide the parent grid item to avoid breaking layout
            let target: HTMLElement;
            if (item.tagName.toLowerCase() === 'yt-lockup-view-model') {
                target = item as HTMLElement;
            } else {
                const parentItem = item.closest('ytd-rich-item-renderer');
                target = parentItem ? parentItem as HTMLElement : item as HTMLElement;
            }
            
            if (target.style.display !== 'none') {
                target.style.display = 'none';
                hiddenCount++;
            }
        }
    });

    // Log how many videos were hidden (for debugging)
    if (hiddenCount > 0) {
        memberVideosLog(`Hidden ${hiddenCount} members-only videos`);
    }
}
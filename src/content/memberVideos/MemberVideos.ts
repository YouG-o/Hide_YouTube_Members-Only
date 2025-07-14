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
    // Select all video grid items
    const videoItems = document.querySelectorAll('ytd-rich-grid-media, ytd-video-renderer');
    let hiddenCount = 0;

    videoItems.forEach(item => {
        // Look for the "Members only" badge inside each video item
        const membersBadge = item.querySelector('.badge-style-type-members-only');
        if (membersBadge) {
            // Hide the parent grid item to avoid breaking the grid layout
            const parentItem = item.closest('ytd-rich-item-renderer');
            const target = parentItem ? parentItem as HTMLElement : item as HTMLElement;
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
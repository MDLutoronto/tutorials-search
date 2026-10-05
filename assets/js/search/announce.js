import { DRAWER_CLOSE_DELAY } from './state.js';

// Status messages for screen readers (WCAG 2.1 SC 4.1.3).
// The visible count lives in #results, which is made inert while the mobile filter
// drawer is open, so the announcement comes from a region outside the drawer background.
const announcer = document.getElementById('statusAnnouncer');

// The announcement must land after the re-render has finished moving focus, or the screen
// reader drops it in favour of whatever just took focus: the facet list refocuses the
// checkbox it just replaced, a tag click sends focus to the results heading, and on mobile
// the drawer closes and hands focus back to the toggle. The last of those is the latest,
// so wait out the drawer close and then some. The delay also collapses the per-keystroke
// updates from the search box into a single message.
const ANNOUNCE_DELAY = DRAWER_CLOSE_DELAY + 300;

let pendingAnnouncement;
let firstRender = true;

// Clearing the region and writing to it in a later task makes screen readers repeat a count
// that has not changed. Nothing here moves focus; the region is never a focus target.
export function announceResultCount(total) {
    // The first render is the page loading, not a status change
    if (firstRender) {
        firstRender = false;
        return;
    }

    announcer.textContent = '';
    clearTimeout(pendingAnnouncement);
    pendingAnnouncement = setTimeout(() => {
        announcer.textContent = total === 0
            ? 'No guides found'
            : `${total} guide${total !== 1 ? 's' : ''} found`;
    }, ANNOUNCE_DELAY);
}

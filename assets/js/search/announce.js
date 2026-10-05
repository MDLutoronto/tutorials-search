// Status messages for screen readers (WCAG 2.1 SC 4.1.3).
// The visible count lives in #results, which is made inert while the mobile filter
// drawer is open, so the announcement comes from a region outside the drawer background.
const announcer = document.getElementById('statusAnnouncer');

let pendingAnnouncement;
let firstRender = true;

// Clearing the region and writing to it in a later task makes screen readers repeat a
// count that has not changed, and keeps the message from being cut off by the focus
// moves that the facet and card re-renders make in the meantime. The delay also
// collapses the per-keystroke updates from the search box into a single message.
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
    }, 300);
}

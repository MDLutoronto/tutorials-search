import { guides, state, emptyFilters } from './state.js';
import { filterGuides, sortGuides } from './filters.js';
import { readURLParameters, updateURL } from './url.js';
import { initFacets, renderFacets } from './facets.js';
import { initCards, renderGuides } from './render.js';
import { initScroll } from './scroll.js';
import { initSidebar } from './sidebar.js';
import { initControls } from './controls.js';

// Recompute the results from state, then redraw the facet counts and the first page of cards
function applyFilters() {
    state.filteredGuides = sortGuides(filterGuides(guides, state.activeFilters), state.currentSort);
    renderFacets();
    renderGuides(true);
}

// Every control that changes the search, filters, sort or page size ends here
function onFiltersChange() {
    updateURL();
    applyFilters();
}

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    state.activeFilters = emptyFilters();
    readURLParameters();
    applyFilters();
});

initFacets(onFiltersChange);
initCards();
initScroll();
initSidebar();
initControls(onFiltersChange);

// Initialize on page load
readURLParameters();
applyFilters();

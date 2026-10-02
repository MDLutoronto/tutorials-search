import { FACETS, state } from './state.js';

const PER_PAGE_OPTIONS = ['12', '24', '48', '100'];

// Load the search, filters, sort and page size from the address bar into state and the form controls
export function readURLParameters() {
    const params = new URLSearchParams(window.location.search);

    // Read search query
    const query = params.get('query') || params.get('q') || params.get('search');
    if (query) {
        state.activeFilters.search = query;
        document.getElementById('searchInput').value = query;
    }

    // Read filter parameters
    FACETS.forEach(facet => {
        const values = params.getAll(facet);
        if (values.length > 0) {
            state.activeFilters[facet] = new Set(values);
        }
        const excluded = params.getAll('not_' + facet).map(v => v.replace(/^"|"$/g, ''));
        if (excluded.length > 0) {
            state.activeFilters.exclude[facet] = new Set(excluded);
        }
    });

    // Read sort parameter
    const sort = params.get('sort');
    if (sort === 'title' || sort === 'date') {
        state.currentSort = sort;
        document.getElementById('sortSelect').value = sort;
    }

    // Read per-page parameter
    const perPage = params.get('perPage') || params.get('show');
    if (PER_PAGE_OPTIONS.includes(perPage)) {
        state.itemsPerLoad = parseInt(perPage);
        document.getElementById('perPageSelect').value = perPage;
    }
}

export function updateURL() {
    const { activeFilters, currentSort, itemsPerLoad } = state;
    const params = new URLSearchParams();

    // Add search query
    if (activeFilters.search) {
        params.set('query', activeFilters.search);
    }

    // Add filter parameters
    FACETS.forEach(facet => {
        activeFilters[facet].forEach(value => params.append(facet, value));
        activeFilters.exclude[facet].forEach(value => params.append('not_' + facet, value));
    });

    // Add sort parameter if not default
    if (currentSort !== 'title') {
        params.set('sort', currentSort);
    }

    // Add per-page parameter if not default
    if (itemsPerLoad !== 12) {
        params.set('perPage', itemsPerLoad.toString());
    }

    // Update URL without reloading page
    const newURL = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.pushState({ filters: activeFilters }, '', newURL);
}

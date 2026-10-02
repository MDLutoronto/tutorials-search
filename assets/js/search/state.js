import { guides } from './guides-data.js';

export { guides };

export const FACETS = ['technique', 'tool', 'dataFormat', 'type', 'series'];

export function emptyFilters() {
    const filters = { search: '', exclude: {} };
    FACETS.forEach(facet => {
        filters[facet] = new Set();
        filters.exclude[facet] = new Set();
    });
    return filters;
}

// Page state shared by every module; modules mutate its properties rather than rebinding imports
export const state = {
    filteredGuides: [...guides],
    activeFilters: emptyFilters(),
    currentSort: 'title',
    displayedCount: 0,
    itemsPerLoad: 12,
    isLoading: false,
    expandedFacets: new Set()
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
export const scrollBehavior = () => prefersReducedMotion.matches ? 'auto' : 'smooth';

// Page elements shared across modules
export const sidebar = document.getElementById('sidebar');
export const filterToggle = document.getElementById('filterToggle');
export const backToTopBtn = document.getElementById('back-to-top');
export const stickySearchWrapper = document.querySelector('.sticky-search-wrapper');

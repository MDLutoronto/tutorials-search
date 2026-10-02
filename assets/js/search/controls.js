import { state, emptyFilters, scrollBehavior, stickySearchWrapper } from './state.js';

const searchInput = document.getElementById('searchInput');

export function initControls(onFiltersChange) {
    // Search input handler
    searchInput.addEventListener('input', (event) => {
        state.activeFilters.search = event.target.value;
        onFiltersChange();
    });

    // Sort handler
    document.getElementById('sortSelect').addEventListener('change', (event) => {
        state.currentSort = event.target.value;
        onFiltersChange();
    });

    // Items per load handler
    document.getElementById('perPageSelect').addEventListener('change', (event) => {
        state.itemsPerLoad = parseInt(event.target.value);
        onFiltersChange();
    });

    // Clear filters
    document.getElementById('clearFilters').addEventListener('click', () => {
        state.activeFilters = emptyFilters();
        searchInput.value = '';
        onFiltersChange();
    });

    // Handle tag clicks for filtering (EXCLUSIVE/ONLY mode)
    document.getElementById('guidesGrid').addEventListener('click', (event) => {
        const tag = event.target.closest('.tag');
        if (!tag) return;

        const { facet, value } = tag.dataset;
        if (!facet || !value) return;

        // If this filter is already the only one active, turn it off;
        // otherwise clear all filters in this category and set only this one
        const selected = state.activeFilters[facet];
        if (selected.size === 1 && selected.has(value)) {
            selected.delete(value);
        } else {
            selected.clear();
            selected.add(value);
        }

        onFiltersChange();

        // The re-render removed the clicked tag, so move focus to the top of the results
        document.querySelector('.results-section').scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
        document.getElementById('resultsHeading').focus({ preventScroll: true });
    });

    // Keyboard shortcut: Ctrl+K or Cmd+K to show and focus search box
    document.addEventListener('keydown', (event) => {
        if (!((event.ctrlKey || event.metaKey) && event.key === 'k')) return;
        event.preventDefault(); // Prevent default browser behavior
        event.stopPropagation(); // Stop event from bubbling

        // Save current scroll position
        const currentScrollY = window.scrollY;

        // Show the search bar if it's hidden
        stickySearchWrapper.classList.remove('scrolled');

        // Use setTimeout to ensure focus happens after the transition starts
        setTimeout(() => {
            searchInput.focus();
            searchInput.select(); // Select all text if any exists

            // Restore scroll position if it changed
            if (window.scrollY !== currentScrollY) {
                window.scrollTo(0, currentScrollY);
            }
        }, 0);
    });

    // Update search hint text based on OS
    if (navigator.platform.toUpperCase().includes('MAC')) {
        document.querySelector('.search-hint').textContent = '⌘K';
    }
}

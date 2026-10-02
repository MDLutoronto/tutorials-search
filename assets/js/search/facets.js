import { guides, state, sidebar } from './state.js';
import { escapeHTML } from './html.js';

const MAX_VISIBLE = 5; // Show first 5 items by default
const FACET_CONTAINERS = {
    technique: 'techniqueFacets',
    tool: 'toolFacets',
    series: 'seriesFacets',
    type: 'typeFacets',
    dataFormat: 'dataFormatFacets'
};

// Extract unique values for facets (handles both arrays and single values)
function getFacetValues(key) {
    const allValues = guides.flatMap(d => {
        const value = d[key];
        if (value === undefined || value === null) return [];
        return Array.isArray(value) ? value : [value];
    });
    return [...new Set(allValues)].filter(v => v !== undefined && v !== null).sort();
}

// Count guides for each facet value (handles both arrays and single values)
function countFacetValues(key, value) {
    return state.filteredGuides.filter(d => {
        const guideValue = d[key];
        if (guideValue === undefined || guideValue === null) return false;
        if (Array.isArray(guideValue)) {
            return guideValue.includes(value);
        }
        return guideValue === value;
    }).length;
}

// Create facet checkboxes with show more functionality
function createFacets(facetKey, containerId) {
    const container = document.getElementById(containerId);
    const values = getFacetValues(facetKey);
    const isExpanded = state.expandedFacets.has(facetKey);

    const facetHTML = values.map((value, index) => {
        const count = countFacetValues(facetKey, value);
        const isChecked = state.activeFilters[facetKey].has(value);
        const isHidden = index >= MAX_VISIBLE && !isExpanded ? 'hidden' : '';
        const id = escapeHTML(`${facetKey}-${value}`);
        return `
            <div class="facet-option ${isHidden}" data-facet-item="${facetKey}">
                <input type="checkbox" id="${id}"
                       data-facet="${facetKey}"
                       data-value="${escapeHTML(value)}"
                       ${isChecked ? 'checked' : ''}>
                <label for="${id}">
                    <span>${escapeHTML(value)}</span>
                    <span class="facet-count">(${count})</span>
                </label>
            </div>
        `;
    }).join('');

    // Add show more button if there are more than MAX_VISIBLE items
    const showMoreBtn = values.length > MAX_VISIBLE
        ? `<button type="button" class="show-more-btn" data-facet="${facetKey}" data-expanded="${isExpanded}" aria-expanded="${isExpanded}">
             ${isExpanded ? 'Show less' : `Show more (${values.length - MAX_VISIBLE})`}
           </button>`
        : '';

    container.innerHTML = facetHTML + showMoreBtn;
}

// Toggle show more/less for facets
function toggleShowMore(button) {
    const facetKey = button.dataset.facet;
    const isExpanded = button.dataset.expanded === 'true';
    const allItems = button.parentElement.querySelectorAll(`.facet-option[data-facet-item="${facetKey}"]`);

    if (isExpanded) {
        // Collapse - hide items beyond MAX_VISIBLE
        allItems.forEach((item, index) => {
            if (index >= MAX_VISIBLE) {
                item.classList.add('hidden');
            }
        });
        button.textContent = `Show more (${allItems.length - MAX_VISIBLE})`;
        state.expandedFacets.delete(facetKey);
    } else {
        // Expand - show all items
        allItems.forEach(item => item.classList.remove('hidden'));
        button.textContent = 'Show less';
        state.expandedFacets.add(facetKey);
    }
    button.dataset.expanded = String(!isExpanded);
    button.setAttribute('aria-expanded', String(!isExpanded));
}

// Redraw facet counts, keeping keyboard focus on the same control after the re-render
export function renderFacets() {
    const focused = document.activeElement;
    const sidebarHadFocus = sidebar.contains(focused);
    const focusedFacet = focused && focused.dataset ? focused.dataset.facet : null;
    const focusedValue = focused && focused.dataset ? focused.dataset.value : null;
    const focusedShowMore = focused && focused.classList && focused.classList.contains('show-more-btn');

    Object.entries(FACET_CONTAINERS).forEach(([facetKey, containerId]) => createFacets(facetKey, containerId));

    if (!sidebarHadFocus || !focusedFacet) return;
    const selector = focusedShowMore
        ? `.show-more-btn[data-facet="${CSS.escape(focusedFacet)}"]`
        : `input[data-facet="${CSS.escape(focusedFacet)}"][data-value="${CSS.escape(focusedValue)}"]`;
    const target = sidebar.querySelector(selector);
    if (target) target.focus();
}

// Listen once on the sidebar, since the facets are re-rendered on every change
export function initFacets(onFiltersChange) {
    sidebar.addEventListener('change', (event) => {
        const { facet, value } = event.target.dataset;
        if (event.target.type !== 'checkbox' || !facet) return;

        if (event.target.checked) {
            state.activeFilters[facet].add(value);
        } else {
            state.activeFilters[facet].delete(value);
        }
        onFiltersChange();
    });

    sidebar.addEventListener('click', (event) => {
        const button = event.target.closest('.show-more-btn');
        if (button) toggleShowMore(button);
    });
}

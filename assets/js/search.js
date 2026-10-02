// Configure marked to open links in new tabs
const renderer = new marked.Renderer();
renderer.link = function(token) {
    return `<a href="${token.href}" target="_blank" rel="noopener noreferrer">${token.text}</a>`;
};
marked.setOptions({ renderer: renderer });

// State management
let filteredGuides = [...guides];
let activeFilters = {
    search: '',
    technique: new Set(),
    tool: new Set(),
    dataFormat: new Set(),
    type: new Set(),
    series: new Set(),
    exclude: {
        technique: new Set(),
        tool: new Set(),
        dataFormat: new Set(),
        type: new Set(),
        series: new Set()
    }
};
let currentSort = 'title';
let displayedCount = 0;
let itemsPerLoad = 12;
let isLoading = false;
const expandedFacets = new Set();
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollBehavior = () => prefersReducedMotion.matches ? 'auto' : 'smooth';

// URL Parameter Management
function readURLParameters() {
    const params = new URLSearchParams(window.location.search);

    // Read search query
    const query = params.get('query') || params.get('q') || params.get('search');
    if (query) {
        activeFilters.search = query;
        document.getElementById('searchInput').value = query;
    }

    // Read filter parameters
    ['technique', 'tool', 'dataFormat', 'type', 'series'].forEach(facet => {
        const values = params.getAll(facet);
        if (values.length > 0) {
            activeFilters[facet] = new Set(values);
        }
        const excluded = params.getAll('not_' + facet).map(v => v.replace(/^"|"$/g, ''));
        if (excluded.length > 0) {
            activeFilters.exclude[facet] = new Set(excluded);
        }
    });

    // Read sort parameter
    const sort = params.get('sort');
    if (sort && (sort === 'title' || sort === 'date')) {
        currentSort = sort;
        document.getElementById('sortSelect').value = sort;
    }

    // Read per-page parameter
    const perPage = params.get('perPage') || params.get('show');
    if (perPage && ['12', '24', '48', '100'].includes(perPage)) {
        itemsPerLoad = parseInt(perPage);
        document.getElementById('perPageSelect').value = perPage;
    }
}

function updateURL() {
    const params = new URLSearchParams();

    // Add search query
    if (activeFilters.search) {
        params.set('query', activeFilters.search);
    }

    // Add filter parameters
    ['technique', 'tool', 'dataFormat', 'type', 'series'].forEach(facet => {
        if (activeFilters[facet].size > 0) {
            activeFilters[facet].forEach(value => {
                params.append(facet, value);
            });
        }
        if (activeFilters.exclude[facet].size > 0) {
            activeFilters.exclude[facet].forEach(value => {
                params.append('not_' + facet, value);
            });
        }
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

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    // Reset filters
    activeFilters = {
        search: '',
        technique: new Set(),
        tool: new Set(),
        dataFormat: new Set(),
        type: new Set(),
        series: new Set(),
        exclude: {
            technique: new Set(),
            tool: new Set(),
            dataFormat: new Set(),
            type: new Set(),
            series: new Set()
        }
    };

    // Read URL parameters again
    readURLParameters();

    // Apply filters
    displayedCount = 0;
    applyFilters();
});

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
    return filteredGuides.filter(d => {
        const guideValue = d[key];
        if (guideValue === undefined || guideValue === null) return false;
        if (Array.isArray(guideValue)) {
            return guideValue.includes(value);
        }
        return guideValue === value;
    }).length;
}

// Initialize facets
function initializeFacets() {
    createFacets('technique', 'techniqueFacets');
    createFacets('tool', 'toolFacets');
    createFacets('series', 'seriesFacets');
    createFacets('type', 'typeFacets');
    createFacets('dataFormat', 'dataFormatFacets');
}

// Create facet checkboxes with show more functionality
function createFacets(facetKey, containerId) {
    const container = document.getElementById(containerId);
    const values = getFacetValues(facetKey);
    const maxVisible = 5; // Show first 5 items by default

    const facetHTML = values.map((value, index) => {
        const count = countFacetValues(facetKey, value);
        const isChecked = activeFilters[facetKey].has(value);
        const isHidden = index >= maxVisible && !expandedFacets.has(facetKey) ? 'hidden' : '';
        return `
            <div class="facet-option ${isHidden}" data-facet-item="${facetKey}">
                <input type="checkbox" id="${facetKey}-${value}"
                       data-facet="${facetKey}"
                       data-value="${value}"
                       ${isChecked ? 'checked' : ''}>
                <label for="${facetKey}-${value}">
                    <span>${value}</span>
                    <span class="facet-count">(${count})</span>
                </label>
            </div>
        `;
    }).join('');

    // Add show more button if there are more than maxVisible items
    const isExpanded = expandedFacets.has(facetKey);
    const showMoreBtn = values.length > maxVisible
        ? `<button type="button" class="show-more-btn" data-facet="${facetKey}" data-expanded="${isExpanded}" aria-expanded="${isExpanded}">
             ${isExpanded ? 'Show less' : `Show more (${values.length - maxVisible})`}
           </button>`
        : '';

    container.innerHTML = facetHTML + showMoreBtn;

    // Add event listeners to checkboxes
    container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleFacetChange);
    });

    // Add event listener to show more button
    const showMoreButton = container.querySelector('.show-more-btn');
    if (showMoreButton) {
        showMoreButton.addEventListener('click', (e) => toggleShowMore(e, facetKey, values.length, maxVisible));
    }
}

// Toggle show more/less for facets
function toggleShowMore(event, facetKey, totalCount, maxVisible) {
    const button = event.target;
    const container = button.parentElement;
    const isExpanded = button.dataset.expanded === 'true';
    const allItems = container.querySelectorAll(`.facet-option[data-facet-item="${facetKey}"]`);

    if (isExpanded) {
        // Collapse - hide items beyond maxVisible
        allItems.forEach((item, index) => {
            if (index >= maxVisible) {
                item.classList.add('hidden');
            }
        });
        button.textContent = `Show more (${totalCount - maxVisible})`;
        button.dataset.expanded = 'false';
        button.setAttribute('aria-expanded', 'false');
        expandedFacets.delete(facetKey);
    } else {
        // Expand - show all items
        allItems.forEach(item => {
            item.classList.remove('hidden');
        });
        button.textContent = 'Show less';
        button.dataset.expanded = 'true';
        button.setAttribute('aria-expanded', 'true');
        expandedFacets.add(facetKey);
    }
}

// Handle facet selection
function handleFacetChange(event) {
    const facet = event.target.dataset.facet;
    const value = event.target.dataset.value;

    if (event.target.checked) {
        activeFilters[facet].add(value);
    } else {
        activeFilters[facet].delete(value);
    }

    displayedCount = 0;
    updateURL();
    applyFilters();
}

// Parse search query into include/exclude term lists.
// Supports: -term  -"multi word"  "quoted include"  plain words
function parseSearchQuery(query) {
    const terms = { include: [], exclude: [] };
    const regex = /(-?"[^"]*"|[^\s]+)/g;
    let match;
    while ((match = regex.exec(query)) !== null) {
        const token = match[1];
        if (token.startsWith('-')) {
            const term = token.slice(1).replace(/^"|"$/g, '').toLowerCase().trim();
            if (term) terms.exclude.push(term);
        } else {
            const term = token.replace(/^"|"$/g, '').toLowerCase().trim();
            if (term) terms.include.push(term);
        }
    }
    return terms;
}

// Apply all filters
function applyFilters() {
    filteredGuides = guides.filter(guide => {
        if (activeFilters.search) {
            const { include, exclude } = parseSearchQuery(activeFilters.search);

            // Collect all searchable text fields for this guide
            const toStr = v => {
                if (!v || v === 'undefined' || v === 'null') return '';
                return (Array.isArray(v) ? v.join(' ') : String(v)).toLowerCase();
            };
            const searchableText = [
                toStr(guide.title),
                toStr(guide.description),
                toStr(guide.series),
                toStr(guide.technique),
                toStr(guide.tool),
                toStr(guide.type),
                toStr(guide.dataFormat)
            ].join(' ');

            // Must match ALL include terms (if any)
            const matchesInclude = include.length === 0 || include.every(term =>
                searchableText.includes(term)
            );

            // Must NOT match ANY exclude terms
            const matchesExclude = exclude.every(term =>
                !searchableText.includes(term)
            );

            if (!matchesInclude || !matchesExclude) return false;
        }

        if (activeFilters.technique.size > 0) {
            const guideCategories = Array.isArray(guide.technique) ? guide.technique : [guide.technique];
            const hasAllTechniques = Array.from(activeFilters.technique).every(selectedTech =>
                guideCategories.includes(selectedTech)
            );
            if (!hasAllTechniques) return false;
        }
        if (activeFilters.exclude.technique.size > 0) {
            const guideCategories = Array.isArray(guide.technique) ? guide.technique : [guide.technique];
            const hasExcluded = Array.from(activeFilters.exclude.technique).some(t => guideCategories.includes(t));
            if (hasExcluded) return false;
        }

        if (activeFilters.tool.size > 0) {
            const guideFormats = Array.isArray(guide.tool) ? guide.tool : [guide.tool];
            const hasAllTools = Array.from(activeFilters.tool).every(selectedTool =>
                guideFormats.includes(selectedTool)
            );
            if (!hasAllTools) return false;
        }
        if (activeFilters.exclude.tool.size > 0) {
            const guideFormats = Array.isArray(guide.tool) ? guide.tool : [guide.tool];
            const hasExcluded = Array.from(activeFilters.exclude.tool).some(t => guideFormats.includes(t));
            if (hasExcluded) return false;
        }

        if (activeFilters.type.size > 0) {
            const guideTypes = Array.isArray(guide.type) ? guide.type : [guide.type];
            const hasAllTypes = Array.from(activeFilters.type).every(selectedType =>
                guideTypes.includes(selectedType)
            );
            if (!hasAllTypes) return false;
        }
        if (activeFilters.exclude.type.size > 0) {
            const guideTypes = Array.isArray(guide.type) ? guide.type : [guide.type];
            const hasExcluded = Array.from(activeFilters.exclude.type).some(t => guideTypes.includes(t));
            if (hasExcluded) return false;
        }

        if (activeFilters.series.size > 0) {
            const guideSeries = Array.isArray(guide.series) ? guide.series : [guide.series];
            const hasAllSeries = Array.from(activeFilters.series).every(selectedSeries =>
                guideSeries.includes(selectedSeries)
            );
            if (!hasAllSeries) return false;
        }
        if (activeFilters.exclude.series.size > 0) {
            const guideSeries = Array.isArray(guide.series) ? guide.series : [guide.series];
            const hasExcluded = Array.from(activeFilters.exclude.series).some(s => guideSeries.includes(s));
            if (hasExcluded) return false;
        }

        if (activeFilters.dataFormat.size > 0) {
            const guideDataFormats = (guide.dataFormat === undefined || guide.dataFormat === null)
                ? []
                : (Array.isArray(guide.dataFormat) ? guide.dataFormat : [guide.dataFormat]);
            const hasAllFormats = Array.from(activeFilters.dataFormat).every(selectedFormat =>
                guideDataFormats.includes(selectedFormat)
            );
            if (!hasAllFormats) return false;
        }
        if (activeFilters.exclude.dataFormat.size > 0) {
            const guideDataFormats = (guide.dataFormat === undefined || guide.dataFormat === null)
                ? []
                : (Array.isArray(guide.dataFormat) ? guide.dataFormat : [guide.dataFormat]);
            const hasExcluded = Array.from(activeFilters.exclude.dataFormat).some(f => guideDataFormats.includes(f));
            if (hasExcluded) return false;
        }

        return true;
    });

    sortGuides();
    updateFacets();
    renderGuides(true); // true = clear existing guides
}

// Update facet counts, keeping keyboard focus on the same control after the re-render
function updateFacets() {
    const focused = document.activeElement;
    const sidebarHadFocus = sidebar.contains(focused);
    const focusedFacet = focused && focused.dataset ? focused.dataset.facet : null;
    const focusedValue = focused && focused.dataset ? focused.dataset.value : null;
    const focusedShowMore = focused && focused.classList && focused.classList.contains('show-more-btn');

    initializeFacets();

    if (!sidebarHadFocus || !focusedFacet) return;
    const selector = focusedShowMore
        ? `.show-more-btn[data-facet="${CSS.escape(focusedFacet)}"]`
        : `input[data-facet="${CSS.escape(focusedFacet)}"][data-value="${CSS.escape(focusedValue)}"]`;
    const target = sidebar.querySelector(selector);
    if (target) target.focus();
}

// Sort guides
function sortGuides() {
    filteredGuides.sort((a, b) => {
        if (currentSort === 'title') {
            return a.title.localeCompare(b.title);
        } else if (currentSort === 'date') {
            return new Date(b.date) - new Date(a.date);
        }
    });
}

// Render guides cards with infinite scroll
function renderGuides(clear = false) {
    const grid = document.getElementById('guidesGrid');
    const loadingIndicator = document.getElementById('loadingIndicator');

    if (clear) {
        grid.innerHTML = '';
        displayedCount = 0;
    }

    if (filteredGuides.length === 0) {
        updatePageInfo();
        grid.innerHTML = `
            <div class="no-results">
                <h3>No guides found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        loadingIndicator.style.display = 'none';
        return;
    }

    // Load next batch of guides
    const startIndex = displayedCount;
    const endIndex = Math.min(startIndex + itemsPerLoad, filteredGuides.length);
    const guidesToRender = filteredGuides.slice(startIndex, endIndex);

    const guidesHTML = guidesToRender.map((guide, index) => {
        const uniqueId = `desc-${startIndex + index}`;

        // Helper function to safely get array values, filtering out undefined/null
        const getArrayValues = (value) => {
            if (!value || value === 'undefined' || value === 'null') return [];
            const arr = Array.isArray(value) ? value : [value];
            return arr.filter(v => v && v !== 'undefined' && v !== 'null');
        };

        const techniques = getArrayValues(guide.technique);
        const tools = getArrayValues(guide.tool);
        const dataFormats = getArrayValues(guide.dataFormat);
        const types = getArrayValues(guide.type);

        // Safely handle description
        const description = guide.description && guide.description !== 'undefined' && guide.description !== 'null' ? guide.description : '';
        const descriptionHtml = description ? marked.parse(description) : '';

        return `
        <div class="guides-card">
            <h3><a href="${guide.url}" target="_blank">${guide.title}</a></h3>
            <div class="guides-description" id="${uniqueId}" data-full-text="${description.replace(/"/g, '&quot;')}">${descriptionHtml}</div>
            <button type="button" class="read-more-btn" id="btn-${uniqueId}" onclick="toggleDescription('${uniqueId}', this)" aria-expanded="false" aria-controls="${uniqueId}" style="display: none;">Read more</button>
            <div class="guides-tags" role="group" aria-label="Filter by tag">
                ${techniques.map(cat => `<button type="button" class="tag technique${activeFilters.technique.has(cat) ? ' active' : ''}" aria-pressed="${activeFilters.technique.has(cat)}" data-facet="technique" data-value="${cat}">${cat}</button>`).join('')}
                ${tools.map(fmt => `<button type="button" class="tag tool${activeFilters.tool.has(fmt) ? ' active' : ''}" aria-pressed="${activeFilters.tool.has(fmt)}" data-facet="tool" data-value="${fmt}">${fmt}</button>`).join('')}
                ${dataFormats.map(fmt => `<button type="button" class="tag dataFormat${activeFilters.dataFormat.has(fmt) ? ' active' : ''}" aria-pressed="${activeFilters.dataFormat.has(fmt)}" data-facet="dataFormat" data-value="${fmt}">${fmt}</button>`).join('')}
                ${types.map(type => `<button type="button" class="tag type${activeFilters.type.has(type) ? ' active' : ''}" aria-pressed="${activeFilters.type.has(type)}" data-facet="type" data-value="${type}">${type}</button>`).join('')}
            </div>
            <div class="guides-meta">
                <span>${guide.series && guide.series !== 'null' && guide.series !== 'undefined' ? guide.series : ''}</span>
                <span>${guide.date || ''}</span>
            </div>
        </div>
        `;
    }).join('');

    grid.insertAdjacentHTML('beforeend', guidesHTML);
    displayedCount = endIndex;

    // Check which descriptions need "Read more" buttons
    guidesToRender.forEach((guide, index) => {
        const uniqueId = `desc-${startIndex + index}`;
        const descElement = document.getElementById(uniqueId);
        const btnElement = document.getElementById(`btn-${uniqueId}`);

        if (descElement && btnElement) {
            // Check if text is truncated by comparing scrollHeight to clientHeight
            if (descElement.scrollHeight > descElement.clientHeight) {
                btnElement.style.display = 'block';
            }
        }
    });

    // Hide loading indicator if all guides are displayed
    if (displayedCount >= filteredGuides.length) {
        loadingIndicator.style.display = 'none';
    }

    isLoading = false;
    updatePageInfo();
}

// Update the header count and footer page info together so they never disagree
function updatePageInfo() {
    const total = filteredGuides.length;
    const label = `${total} guide${total !== 1 ? 's' : ''}`;
    document.getElementById('resultsCount').textContent = label;
    document.getElementById('pageInfo').textContent =
        total === 0 ? '' :
        displayedCount >= total ? `Showing all ${label}` :
        `Showing ${displayedCount} of ${label}`;
}

// Infinite scroll handler
function handleScroll() {
    if (isLoading || displayedCount >= filteredGuides.length) {
        return;
    }

    const loadingIndicator = document.getElementById('loadingIndicator');
    const guidesGrid = document.getElementById('guidesGrid');

    // Get the position of the loading indicator
    const rect = loadingIndicator.getBoundingClientRect();
    const isLoadingIndicatorVisible = rect.top < window.innerHeight + 300;

    // Only load more if the loading indicator area is near the viewport
    if (isLoadingIndicatorVisible) {
        isLoading = true;
        loadingIndicator.style.display = 'block';

        // Simulate a small delay for better UX
        setTimeout(() => {
            renderGuides(false);
        }, 200);
    }
}

// Throttle scroll event for performance and handle mobile button hiding
let scrollTimeout;
let lastScrollTop = 0;
const filterToggle = document.getElementById('filterToggle');
const backToTopBtn = document.getElementById('back-to-top');
const stickySearchWrapper = document.querySelector('.sticky-search-wrapper');

window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
        handleScroll();

        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        // Hide search bar when scrolling down (when not at top), unless it holds focus
        const searchHasFocus = stickySearchWrapper && stickySearchWrapper.contains(document.activeElement);
        if (currentScroll > lastScrollTop && currentScroll > 200 && !searchHasFocus) {
            // Scrolling down
            if (stickySearchWrapper) stickySearchWrapper.classList.add('scrolled');
        } else {
            // Scrolling up or at top
            if (stickySearchWrapper) stickySearchWrapper.classList.remove('scrolled');
        }

        // Hide filter toggle and back-to-top button when scrolling down on mobile
        if (window.innerWidth <= 1024) {
            if (currentScroll > lastScrollTop && currentScroll > 200) {
                // Scrolling down
                if (filterToggle) filterToggle.classList.add('scrolled');
                if (backToTopBtn) backToTopBtn.classList.add('scrolled');
            } else {
                // Scrolling up or at top
                if (filterToggle) filterToggle.classList.remove('scrolled');
                if (backToTopBtn) backToTopBtn.classList.remove('scrolled');
            }
        }

        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }, 150);
}, { passive: true });

// Search input handler
document.getElementById('searchInput').addEventListener('input', (event) => {
    activeFilters.search = event.target.value;
    displayedCount = 0;
    updateURL();
    applyFilters();
});

// Sort handler
document.getElementById('sortSelect').addEventListener('change', (event) => {
    currentSort = event.target.value;
    displayedCount = 0;
    updateURL();
    applyFilters();
});

// Items per load handler
document.getElementById('perPageSelect').addEventListener('change', (event) => {
    itemsPerLoad = parseInt(event.target.value);
    displayedCount = 0;
    updateURL();
    applyFilters();
});

// Clear filters
document.getElementById('clearFilters').addEventListener('click', () => {
    activeFilters = {
        search: '',
        technique: new Set(),
        tool: new Set(),
        dataFormat: new Set(),
        type: new Set(),
        series: new Set(),
        exclude: {
            technique: new Set(),
            tool: new Set(),
            dataFormat: new Set(),
            type: new Set(),
            series: new Set()
        }
    };
    document.getElementById('searchInput').value = '';
    displayedCount = 0;
    updateURL();
    applyFilters();
});

// Handle tag clicks for filtering (EXCLUSIVE/ONLY mode)
document.getElementById('guidesGrid').addEventListener('click', (event) => {
    const tag = event.target.closest('.tag');
    if (!tag) return;

    const facet = tag.dataset.facet;
    const value = tag.dataset.value;

    if (!facet || !value) return;

    // EXCLUSIVE mode: If this filter is already the only one active, remove it
    // Otherwise, clear all filters in this category and set only this one
    if (activeFilters[facet].size === 1 && activeFilters[facet].has(value)) {
        // If clicking the only active filter, turn it off
        activeFilters[facet].delete(value);
    } else {
        // Clear all filters in this category and set only this one
        activeFilters[facet].clear();
        activeFilters[facet].add(value);
    }

    displayedCount = 0;
    updateURL();
    applyFilters();

    // The re-render removed the clicked tag, so move focus to the top of the results
    document.querySelector('.results-section').scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    document.getElementById('resultsHeading').focus({ preventScroll: true });
});

// A link in the clamped part of a description would scroll the clipped box and garble it,
// so expand the description when focus lands on something it hides
document.getElementById('guidesGrid').addEventListener('focusin', (event) => {
    const description = event.target.closest('.guides-description');
    if (!description || description.classList.contains('expanded')) return;

    description.scrollTop = 0;
    if (event.target.getBoundingClientRect().bottom > description.getBoundingClientRect().bottom) {
        toggleDescription(description.id, document.getElementById(`btn-${description.id}`));
    }
});

// Keyboard shortcut: Ctrl+K or Cmd+K to show and focus search box
document.addEventListener('keydown', (event) => {
    // Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault(); // Prevent default browser behavior
        event.stopPropagation(); // Stop event from bubbling

        // Save current scroll position
        const currentScrollY = window.scrollY;

        // Show the search bar if it's hidden
        if (stickySearchWrapper && stickySearchWrapper.classList.contains('scrolled')) {
            stickySearchWrapper.classList.remove('scrolled');
        }

        // Focus and select the search input
        const searchInput = document.getElementById('searchInput');

        // Use setTimeout to ensure focus happens after the transition starts
        setTimeout(() => {
            searchInput.focus();
            searchInput.select(); // Select all text if any exists

            // Restore scroll position if it changed
            if (window.scrollY !== currentScrollY) {
                window.scrollTo(0, currentScrollY);
            }
        }, 0);
    }
});

// Toggle description expand/collapse
function toggleDescription(descriptionId, button) {
    const description = document.getElementById(descriptionId);
    if (description.classList.contains('expanded')) {
        description.classList.remove('expanded');
        button.textContent = 'Read more';
        button.setAttribute('aria-expanded', 'false');
    } else {
        description.classList.add('expanded');
        button.textContent = 'Read less';
        button.setAttribute('aria-expanded', 'true');
    }
}

// Make function globally accessible
window.toggleDescription = toggleDescription;

// Update search hint text based on OS
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const searchHint = document.querySelector('.search-hint');
if (isMac) {
    searchHint.textContent = '⌘K';
}

// Mobile sidebar toggle functionality
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

const drawerBackground = [
    document.querySelector('.container > header'),
    stickySearchWrapper,
    filterToggle,
    document.getElementById('results'),
    backToTopBtn
];

function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('show');
    filterToggle.setAttribute('aria-expanded', 'true');
    drawerBackground.forEach(el => el.inert = true);
    document.body.style.overflow = 'hidden';
    document.getElementById('filtersHeading').focus();
}

function closeSidebar() {
    if (!sidebar.classList.contains('open')) return;
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
    filterToggle.setAttribute('aria-expanded', 'false');
    drawerBackground.forEach(el => el.inert = false);
    document.body.style.overflow = '';
    filterToggle.focus();
}

filterToggle.addEventListener('click', openSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
document.getElementById('sidebarClose').addEventListener('click', closeSidebar);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSidebar();
});

// Leaving the mobile layout with the drawer open would strand the inert background
window.matchMedia('(max-width: 1024px)').addEventListener('change', (event) => {
    if (!event.matches) closeSidebar();
});

// Close sidebar when a filter is selected on mobile
sidebar.addEventListener('click', (event) => {
    if (window.innerWidth <= 1024 && event.target.type === 'checkbox') {
        setTimeout(closeSidebar, 300); // Small delay for better UX
    }
});

// Initialize on page load
readURLParameters(); // Read URL parameters first
initializeFacets();
applyFilters();

// Show/hide back to top button based on scroll position
window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('show', window.scrollY > 300);
}, { passive: true });

// Smooth scroll to top, and take keyboard focus there too
backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    document.getElementById('top').focus({ preventScroll: true });
});

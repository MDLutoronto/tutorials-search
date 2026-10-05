import { state } from './state.js';
import { escapeHTML, renderMarkdown } from './html.js';
import { announceResultCount } from './announce.js';

const grid = document.getElementById('guidesGrid');
const loadingIndicator = document.getElementById('loadingIndicator');

// Safely get array values, filtering out undefined/null
function getArrayValues(value) {
    if (!value || value === 'undefined' || value === 'null') return [];
    const arr = Array.isArray(value) ? value : [value];
    return arr.filter(v => v && v !== 'undefined' && v !== 'null');
}

function tagButtons(facet, values) {
    return values.map(value => {
        const active = state.activeFilters[facet].has(value);
        return `<button type="button" class="tag ${facet}${active ? ' active' : ''}" aria-pressed="${active}" data-facet="${facet}" data-value="${escapeHTML(value)}">${escapeHTML(value)}</button>`;
    }).join('');
}

function guideCard(guide, uniqueId) {
    // Safely handle description
    const description = guide.description && guide.description !== 'undefined' && guide.description !== 'null' ? guide.description : '';
    const series = guide.series && guide.series !== 'null' && guide.series !== 'undefined' ? guide.series : '';

    return `
        <div class="guides-card">
            <h3><a href="${escapeHTML(guide.url)}" target="_blank">${escapeHTML(guide.title)}</a></h3>
            <div class="guides-description" id="${uniqueId}">${description ? renderMarkdown(description) : ''}</div>
            <button type="button" class="read-more-btn" id="btn-${uniqueId}" aria-expanded="false" aria-controls="${uniqueId}" hidden>Read more</button>
            <div class="guides-tags" role="group" aria-label="Filter by tag">
                ${tagButtons('technique', getArrayValues(guide.technique))}
                ${tagButtons('tool', getArrayValues(guide.tool))}
                ${tagButtons('dataFormat', getArrayValues(guide.dataFormat))}
                ${tagButtons('type', getArrayValues(guide.type))}
            </div>
            <div class="guides-meta">
                <span>${escapeHTML(series)}</span>
                <span>${escapeHTML(guide.date || '')}</span>
            </div>
        </div>
    `;
}

// Render guides cards with infinite scroll
export function renderGuides(clear = false) {
    if (clear) {
        grid.innerHTML = '';
        state.displayedCount = 0;
        // Only a fresh result set is a status change; appending the next batch is not
        announceResultCount(state.filteredGuides.length);
    }

    const { filteredGuides } = state;
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
    const startIndex = state.displayedCount;
    const endIndex = Math.min(startIndex + state.itemsPerLoad, filteredGuides.length);
    const guidesToRender = filteredGuides.slice(startIndex, endIndex);

    grid.insertAdjacentHTML('beforeend', guidesToRender.map((guide, index) => guideCard(guide, `desc-${startIndex + index}`)).join(''));
    state.displayedCount = endIndex;

    // Show "Read more" only where the description is truncated
    guidesToRender.forEach((guide, index) => {
        const uniqueId = `desc-${startIndex + index}`;
        const descElement = document.getElementById(uniqueId);
        if (descElement.scrollHeight > descElement.clientHeight) {
            document.getElementById(`btn-${uniqueId}`).hidden = false;
        }
    });

    // Hide loading indicator if all guides are displayed
    if (state.displayedCount >= filteredGuides.length) {
        loadingIndicator.style.display = 'none';
    }

    state.isLoading = false;
    updatePageInfo();
}

// Update the header count and footer page info together so they never disagree
function updatePageInfo() {
    const total = state.filteredGuides.length;
    const label = `${total} guide${total !== 1 ? 's' : ''}`;
    document.getElementById('resultsCount').textContent = label;
    document.getElementById('pageInfo').textContent =
        total === 0 ? '' :
        state.displayedCount >= total ? `Showing all ${label}` :
        `Showing ${state.displayedCount} of ${label}`;
}

// Toggle description expand/collapse
function toggleDescription(description, button) {
    const expanded = description.classList.toggle('expanded');
    button.textContent = expanded ? 'Read less' : 'Read more';
    button.setAttribute('aria-expanded', String(expanded));
}

export function initCards() {
    grid.addEventListener('click', (event) => {
        const button = event.target.closest('.read-more-btn');
        if (button) toggleDescription(document.getElementById(button.getAttribute('aria-controls')), button);
    });

    // A link in the clamped part of a description would scroll the clipped box and garble it,
    // so expand the description when focus lands on something it hides
    grid.addEventListener('focusin', (event) => {
        const description = event.target.closest('.guides-description');
        if (!description || description.classList.contains('expanded')) return;

        description.scrollTop = 0;
        if (event.target.getBoundingClientRect().bottom > description.getBoundingClientRect().bottom) {
            toggleDescription(description, document.getElementById(`btn-${description.id}`));
        }
    });
}

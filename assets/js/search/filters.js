import { FACETS } from './state.js';

// Facet fields hold a single value, an array, or nothing
const toArray = value => (value === undefined || value === null) ? [] : (Array.isArray(value) ? value : [value]);

// Parse search query into include/exclude term lists.
// Supports: -term  -"multi word"  "quoted include"  plain words
export function parseSearchQuery(query) {
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

function matchesSearch(guide, { include, exclude }) {
    // Collect all searchable text fields for this guide
    const toStr = v => {
        if (!v || v === 'undefined' || v === 'null') return '';
        return (Array.isArray(v) ? v.join(' ') : String(v)).toLowerCase();
    };
    const searchableText = [
        guide.title, guide.description, guide.series, guide.technique, guide.tool, guide.type, guide.dataFormat
    ].map(toStr).join(' ');

    // Must match ALL include terms and NOT match ANY exclude terms
    return include.every(term => searchableText.includes(term)) &&
        exclude.every(term => !searchableText.includes(term));
}

// A guide must have every selected value and none of the excluded values in each facet
function matchesFacets(guide, filters) {
    return FACETS.every(facet => {
        const values = toArray(guide[facet]);
        return [...filters[facet]].every(v => values.includes(v)) &&
            ![...filters.exclude[facet]].some(v => values.includes(v));
    });
}

export function filterGuides(guides, filters) {
    const terms = filters.search ? parseSearchQuery(filters.search) : null;
    return guides.filter(guide =>
        (!terms || matchesSearch(guide, terms)) && matchesFacets(guide, filters)
    );
}

export function sortGuides(guides, sort) {
    return guides.sort((a, b) => {
        if (sort === 'title') {
            return a.title.localeCompare(b.title);
        } else if (sort === 'date') {
            return new Date(b.date) - new Date(a.date);
        }
    });
}

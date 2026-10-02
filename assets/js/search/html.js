const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// Escape text for safe use in HTML content and attribute values
export function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => HTML_ESCAPES[char]);
}

// Configure marked to open links in new tabs
const renderer = new marked.Renderer();
renderer.link = function(token) {
    return `<a href="${token.href}" target="_blank" rel="noopener noreferrer">${token.text}</a>`;
};
marked.setOptions({ renderer: renderer });

// Render Markdown, then strip anything unsafe; DOMPurify drops target by default, so keep it for the new-tab links
export function renderMarkdown(markdown) {
    return DOMPurify.sanitize(marked.parse(markdown), { ADD_ATTR: ['target'] });
}

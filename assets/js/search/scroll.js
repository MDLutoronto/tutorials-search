import { state, scrollBehavior, backToTopBtn, stickySearchWrapper } from './state.js';
import { renderGuides } from './render.js';

const loadingIndicator = document.getElementById('loadingIndicator');

// Infinite scroll handler
function handleScroll() {
    if (state.isLoading || state.displayedCount >= state.filteredGuides.length) {
        return;
    }

    // Only load more if the loading indicator area is near the viewport
    if (loadingIndicator.getBoundingClientRect().top < window.innerHeight + 300) {
        state.isLoading = true;
        loadingIndicator.style.display = 'block';

        // Simulate a small delay for better UX
        setTimeout(() => {
            renderGuides(false);
        }, 200);
    }
}

// The search bar stays pinned, so --sticky-search-h is what keeps the Filters
// button and every scroll-into-view target clear of it. The stylesheet's value
// is only a starting guess; measure the bar so the offsets still hold once text
// is resized or the label wraps (1.4.4).
function trackStickyHeight() {
    const sync = () => document.documentElement.style.setProperty(
        '--sticky-search-h',
        `${Math.round(stickySearchWrapper.getBoundingClientRect().height)}px`
    );

    sync();
    new ResizeObserver(sync).observe(stickySearchWrapper);
}

export function initScroll() {
    trackStickyHeight();

    // Throttle scroll event for performance
    let scrollTimeout;

    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScroll, 150);
    }, { passive: true });

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
}

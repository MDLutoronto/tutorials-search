import { state, scrollBehavior, filterToggle, backToTopBtn, stickySearchWrapper } from './state.js';
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

export function initScroll() {
    // Throttle scroll event for performance and handle mobile button hiding
    let scrollTimeout;
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            handleScroll();

            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            const scrollingDown = currentScroll > lastScrollTop && currentScroll > 200;

            // Hide search bar when scrolling down (when not at top), unless it holds focus
            const searchHasFocus = stickySearchWrapper.contains(document.activeElement);
            stickySearchWrapper.classList.toggle('scrolled', scrollingDown && !searchHasFocus);

            // Hide filter toggle and back-to-top button when scrolling down on mobile
            if (window.innerWidth <= 1024) {
                filterToggle.classList.toggle('scrolled', scrollingDown);
                backToTopBtn.classList.toggle('scrolled', scrollingDown);
            }

            lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
        }, 150);
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

import { sidebar, filterToggle, backToTopBtn, stickySearchWrapper, DRAWER_CLOSE_DELAY } from './state.js';

// Mobile sidebar toggle functionality
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

export function initSidebar() {
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
            setTimeout(closeSidebar, DRAWER_CLOSE_DELAY); // Small delay for better UX
        }
    });
}

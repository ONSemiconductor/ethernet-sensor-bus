// OnSemi Sphinx Theme - Dark Mode Toggle
(function() {
    'use strict';

    // Check for saved theme preference or default to system preference
    function getPreferredTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Apply theme to document
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateToggleButton(theme);
        // CSS files are loaded by default, transitions will be smooth
    }

    // Update toggle button appearance
    function updateToggleButton(theme) {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('.theme-icon');
            if (theme === 'dark') {
                icon.textContent = '☀️';
                toggleBtn.setAttribute('aria-label', 'Switch to light mode');
                toggleBtn.setAttribute('title', 'Switch to light mode');
            } else {
                icon.textContent = '🌙';
                toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
                toggleBtn.setAttribute('title', 'Switch to dark mode');
            }
        }
    }

    // Create and inject toggle button
    function createToggleButton() {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'theme-toggle';
        toggleBtn.className = 'theme-toggle-button';
        toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
        toggleBtn.innerHTML = '<span class="theme-icon">🌙</span>';
        
        toggleBtn.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });

        // Try to add button to the navbar
        const navbar = document.querySelector('.wy-side-nav-search') || 
                      document.querySelector('.wy-nav-top');
        
        if (navbar) {
            navbar.appendChild(toggleBtn);
        } else {
            // Fallback: add to body if navbar not found
            document.body.appendChild(toggleBtn);
        }
    }

    // Add CSS styles for the toggle button
    function addToggleStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .theme-toggle-button {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 2px solid var(--onsemi-border, #ddd);
                background: var(--onsemi-light-alt, #fff);
                color: var(--onsemi-text, #333);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                transition: all 0.3s ease;
                z-index: 1000;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }
            
            .theme-toggle-button:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
                background: var(--onsemi-secondary, #f0690a);
            }
            
            .theme-toggle-button:active {
                transform: scale(0.95);
            }
            
            .theme-toggle-button .theme-icon {
                display: block;
                line-height: 1;
            }

            /* Adjust for mobile */
            @media screen and (max-width: 768px) {
                .theme-toggle-button {
                    top: 5px;
                    right: 5px;
                    width: 35px;
                    height: 35px;
                    font-size: 18px;
                }
            }

            /* Smooth transitions for theme changes */
            * {
                transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize theme on page load
    function init() {
        // Add styles first
        addToggleStyles();
        
        // Set initial theme
        const theme = getPreferredTheme();
        setTheme(theme);
        
        // Create toggle button
        createToggleButton();
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            // Only auto-switch if user hasn't manually set a preference
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// Sidebar TOC: persist expansions via `.force-open`; only collapse via minus toggle
(function() {
    'use strict';

    // LocalStorage key for expanded items
    const LS_KEY = 'tocExpandedItems';

    function getStore() {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return [];
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr : [];
        } catch (_e) {
            return [];
        }
    }

    function setStore(items) {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(items));
        } catch (_e) {
            // ignore
        }
    }

    function addItem(href) {
        const items = getStore();
        if (!items.includes(href)) {
            items.push(href);
            setStore(items);
        }
    }

    function removeItem(href) {
        const items = getStore().filter(x => x !== href);
        setStore(items);
    }

    function restoreExpanded() {
        const items = getStore();
        if (!items.length) return;
        // Ensure jQuery exists
        if (typeof $ === 'undefined') return;

        items.forEach(href => {
            // Find matching anchor in the sidebar and expand its <li>
            const $a = $('.wy-menu-vertical li > a[href]')
                .filter(function() {
                    // Match exact href or end match for relative paths
                    const h = this.getAttribute('href');
                    return h === href || (h && href && h.endsWith(href));
                })
                .first();
            if ($a.length) {
                const $li = $a.closest('li');
                $li.addClass('force-open');
                $li.parents('li').addClass('force-open');
            }
        });
    }

    function initTocPersistence() {
        // Wait for jQuery/DOM
        if (typeof $ === 'undefined') {
            setTimeout(initTocPersistence, 100);
            return;
        }

        // Restore previously expanded items after page load
        restoreExpanded();

        // Handle plus/minus toggle clicks: only collapse/expand that node
        $('.wy-menu-vertical').on('click', '.toctree-expand', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const $li = $(this).closest('li');
            const $a = $li.children('a[href]');
            const href = $a.attr('href') || '';

            if ($li.hasClass('force-open')) {
                $li.removeClass('force-open');
                removeItem(href);
            } else {
                $li.addClass('force-open');
                $li.parents('li').addClass('force-open');
                addItem(href);
            }
        });

        // Clicking normal links should not collapse other trees; let navigation proceed.
        // No additional handler needed—state is restored on next page.
    }

    // Run after window load so theme scripts finish first
    window.addEventListener('load', initTocPersistence);
})();

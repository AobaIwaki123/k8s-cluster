/**
 * Theme Management
 * k8s Cluster Documentation
 */

(function() {
  'use strict';
  
  const THEME_KEY = 'docs-theme';
  const THEME_ATTRIBUTE = 'data-theme';
  
  // Theme manager
  const ThemeManager = {
    
    /**
     * Initialize theme
     */
    init() {
      this.loadTheme();
      this.setupToggle();
      this.watchSystemTheme();
    },
    
    /**
     * Get current theme
     */
    getTheme() {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) {
        return savedTheme;
      }
      
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      
      return CONFIG.defaultTheme || 'light';
    },
    
    /**
     * Set theme
     */
    setTheme(theme) {
      document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
      localStorage.setItem(THEME_KEY, theme);
      this.updateToggleIcon(theme);
    },
    
    /**
     * Toggle theme
     */
    toggleTheme() {
      const currentTheme = this.getTheme();
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      this.setTheme(newTheme);
    },
    
    /**
     * Load saved theme
     */
    loadTheme() {
      const theme = this.getTheme();
      this.setTheme(theme);
    },
    
    /**
     * Setup theme toggle button
     */
    setupToggle() {
      const toggleBtn = document.querySelector('.theme-toggle');
      if (!toggleBtn) return;
      
      toggleBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
      
      // Keyboard shortcut (Alt+T)
      document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 't') {
          e.preventDefault();
          this.toggleTheme();
        }
      });
    },
    
    /**
     * Update toggle icon
     */
    updateToggleIcon(theme) {
      const toggleBtn = document.querySelector('.theme-toggle');
      if (!toggleBtn) return;
      
      const icon = toggleBtn.querySelector('.theme-icon');
      if (!icon) return;
      
      if (theme === 'dark') {
        icon.className = 'theme-icon fas fa-sun';
        toggleBtn.setAttribute('aria-label', 'Switch to light mode');
      } else {
        icon.className = 'theme-icon fas fa-moon';
        toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
      }
    },
    
    /**
     * Watch system theme changes
     */
    watchSystemTheme() {
      if (!window.matchMedia) return;
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a theme
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (!savedTheme) {
          const newTheme = e.matches ? 'dark' : 'light';
          this.setTheme(newTheme);
        }
      });
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
  } else {
    ThemeManager.init();
  }
  
  // Export for use in other modules
  window.ThemeManager = ThemeManager;
  
})();

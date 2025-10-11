/**
 * Search Functionality
 * k8s Cluster Documentation
 */

(function() {
  'use strict';
  
  const SearchManager = {
    searchIndex: [],
    isInitialized: false,
    
    /**
     * Initialize search
     */
    init() {
      if (!CONFIG.searchEnabled) return;
      
      this.setupSearch();
      this.buildSearchIndex();
      this.setupKeyboardShortcut();
      this.isInitialized = true;
    },
    
    /**
     * Setup search input and results
     */
    setupSearch() {
      const searchInput = document.querySelector('.search-input');
      if (!searchInput) return;
      
      // Create results container if it doesn't exist
      let resultsContainer = document.querySelector('.search-results');
      if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        resultsContainer.style.cssText = `
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 0.5rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          max-height: 400px;
          overflow-y: auto;
          display: none;
          z-index: 1000;
        `;
        searchInput.parentElement.appendChild(resultsContainer);
      }
      
      // Handle search input
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.performSearch(e.target.value);
        }, 300);
      });
      
      // Handle focus/blur
      searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim()) {
          this.performSearch(searchInput.value);
        }
      });
      
      // Close results when clicking outside
      document.addEventListener('click', (e) => {
        if (!searchInput.parentElement.contains(e.target)) {
          this.hideResults();
        }
      });
      
      // Handle ESC key
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hideResults();
          searchInput.blur();
        }
      });
    },
    
    /**
     * Build search index from navigation
     */
    buildSearchIndex() {
      if (!CONFIG.navigation) return;
      
      CONFIG.navigation.forEach(section => {
        section.items.forEach(item => {
          this.searchIndex.push({
            title: item.title,
            category: section.title,
            url: item.url,
            keywords: item.title.toLowerCase()
          });
        });
      });
    },
    
    /**
     * Perform search
     */
    performSearch(query) {
      const resultsContainer = document.querySelector('.search-results');
      if (!resultsContainer) return;
      
      query = query.trim().toLowerCase();
      
      if (query.length === 0) {
        this.hideResults();
        return;
      }
      
      // Search in index
      const results = this.searchIndex.filter(item => {
        return item.keywords.includes(query);
      });
      
      this.displayResults(results, query);
    },
    
    /**
     * Display search results
     */
    displayResults(results, query) {
      const resultsContainer = document.querySelector('.search-results');
      if (!resultsContainer) return;
      
      if (results.length === 0) {
        resultsContainer.innerHTML = `
          <div style="padding: 1rem; text-align: center; color: var(--text-secondary);">
            <i class="fas fa-search" style="font-size: 2rem; opacity: 0.3; margin-bottom: 0.5rem;"></i>
            <p style="margin: 0;">「${query}」の検索結果が見つかりませんでした</p>
          </div>
        `;
        resultsContainer.style.display = 'block';
        return;
      }
      
      let html = '';
      results.forEach(result => {
        // Highlight matching text
        const highlightedTitle = this.highlightText(result.title, query);
        
        html += `
          <a href="${result.url}" class="search-result-item" style="
            display: block;
            padding: 0.75rem 1rem;
            text-decoration: none;
            border-bottom: 1px solid var(--border-light);
            transition: background-color 0.15s;
          ">
            <div style="
              font-weight: 500;
              color: var(--text-primary);
              margin-bottom: 0.25rem;
            ">${highlightedTitle}</div>
            <div style="
              font-size: 0.875rem;
              color: var(--text-secondary);
            ">
              <i class="fas fa-folder" style="margin-right: 0.25rem;"></i>
              ${result.category}
            </div>
          </a>
        `;
      });
      
      resultsContainer.innerHTML = html;
      resultsContainer.style.display = 'block';
      
      // Add hover styles
      const resultItems = resultsContainer.querySelectorAll('.search-result-item');
      resultItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
          this.style.backgroundColor = 'var(--bg-tertiary)';
        });
        item.addEventListener('mouseleave', function() {
          this.style.backgroundColor = '';
        });
      });
    },
    
    /**
     * Highlight matching text
     */
    highlightText(text, query) {
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, '<mark style="background-color: var(--warning-light); padding: 0.125rem 0.25rem; border-radius: 0.125rem;">$1</mark>');
    },
    
    /**
     * Hide results
     */
    hideResults() {
      const resultsContainer = document.querySelector('.search-results');
      if (resultsContainer) {
        resultsContainer.style.display = 'none';
      }
    },
    
    /**
     * Setup keyboard shortcut (Ctrl+K or Cmd+K)
     */
    setupKeyboardShortcut() {
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          const searchInput = document.querySelector('.search-input');
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        }
      });
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SearchManager.init());
  } else {
    SearchManager.init();
  }
  
  // Export for use in other modules
  window.SearchManager = SearchManager;
  
})();

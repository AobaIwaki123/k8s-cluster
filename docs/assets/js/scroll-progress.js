/**
 * Scroll Progress Indicator
 * k8s Cluster Documentation
 */

(function() {
  'use strict';
  
  const ScrollProgress = {
    progressBar: null,
    scrollToTopBtn: null,
    
    /**
     * Initialize scroll progress
     */
    init() {
      this.createProgressBar();
      this.createScrollToTopButton();
      this.setupScrollListener();
    },
    
    /**
     * Create progress bar element
     */
    createProgressBar() {
      // Check if progress bar already exists
      if (document.querySelector('.scroll-progress')) return;
      
      const progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress';
      progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
      
      // Insert at the beginning of body
      document.body.insertBefore(progressBar, document.body.firstChild);
      
      this.progressBar = progressBar.querySelector('.scroll-progress-bar');
    },
    
    /**
     * Create scroll to top button
     */
    createScrollToTopButton() {
      // Check if button already exists
      if (document.querySelector('.scroll-to-top')) return;
      
      const button = document.createElement('button');
      button.className = 'scroll-to-top';
      button.setAttribute('aria-label', 'Scroll to top');
      button.innerHTML = '<i class="fas fa-arrow-up"></i>';
      
      // Add click handler
      button.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
      
      document.body.appendChild(button);
      this.scrollToTopBtn = button;
    },
    
    /**
     * Setup scroll event listener
     */
    setupScrollListener() {
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            this.updateProgress();
            this.updateScrollToTopButton();
            ticking = false;
          });
          
          ticking = true;
        }
      });
      
      // Initial update
      this.updateProgress();
      this.updateScrollToTopButton();
    },
    
    /**
     * Update progress bar
     */
    updateProgress() {
      if (!this.progressBar) return;
      
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Calculate progress percentage
      const maxScroll = documentHeight - windowHeight;
      const scrollPercentage = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      
      // Update progress bar width
      this.progressBar.style.width = `${Math.min(scrollPercentage, 100)}%`;
    },
    
    /**
     * Update scroll to top button visibility
     */
    updateScrollToTopButton() {
      if (!this.scrollToTopBtn) return;
      
      const threshold = CONFIG.scrollToTopThreshold || 300;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > threshold) {
        this.scrollToTopBtn.classList.add('visible');
      } else {
        this.scrollToTopBtn.classList.remove('visible');
      }
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ScrollProgress.init());
  } else {
    ScrollProgress.init();
  }
  
  // Export for use in other modules
  window.ScrollProgress = ScrollProgress;
  
})();

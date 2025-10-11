/**
 * Table of Contents Generator
 * k8s Cluster Documentation
 */

(function() {
  'use strict';
  
  const TOCManager = {
    
    /**
     * Initialize TOC
     */
    init() {
      this.generateTOC();
      this.setupScrollSpy();
    },
    
    /**
     * Generate table of contents
     */
    generateTOC() {
      const tocContainer = document.querySelector('.toc-container');
      const content = document.querySelector('.article-content');
      
      if (!tocContainer || !content) return;
      
      const selector = CONFIG.tocSelector || 'h2, h3';
      const headings = content.querySelectorAll(selector);
      
      const minHeadings = CONFIG.tocMinHeadings || 3;
      if (headings.length < minHeadings) {
        tocContainer.style.display = 'none';
        return;
      }
      
      // Build TOC HTML
      let html = `
        <h4 class="toc-title">目次</h4>
        <ul class="toc-list">
      `;
      
      headings.forEach((heading, index) => {
        // Add ID to heading if it doesn't have one
        if (!heading.id) {
          heading.id = 'heading-' + index;
        }
        
        const level = heading.tagName.toLowerCase();
        const text = heading.textContent.trim();
        const itemClass = level === 'h3' ? 'toc-item toc-item-h3' : 'toc-item';
        
        html += `
          <li class="${itemClass}">
            <a href="#${heading.id}" class="toc-link" data-target="${heading.id}">
              ${text}
            </a>
          </li>
        `;
      });
      
      html += `
        </ul>
      `;
      
      tocContainer.innerHTML = html;
      tocContainer.classList.add('has-toc');
      
      // Add class to main wrapper
      const mainWrapper = document.querySelector('.main-wrapper');
      if (mainWrapper) {
        mainWrapper.classList.add('has-toc');
      }
      
      // Setup TOC link clicks
      const tocLinks = tocContainer.querySelectorAll('.toc-link');
      tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('data-target');
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            const offset = CONFIG.scrollOffset || 80;
            const elementPosition = targetElement.offsetTop;
            const offsetPosition = elementPosition - offset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
            
            // Update URL
            history.pushState(null, null, '#' + targetId);
          }
        });
      });
    },
    
    /**
     * Setup scroll spy (highlight active section in TOC)
     */
    setupScrollSpy() {
      const tocLinks = document.querySelectorAll('.toc-link');
      if (tocLinks.length === 0) return;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            
            // Remove active class from all links
            tocLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to current link
            const activeLink = document.querySelector(`.toc-link[data-target="${id}"]`);
            if (activeLink) {
              activeLink.classList.add('active');
            }
          }
        });
      }, {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0
      });
      
      // Observe all headings
      const selector = CONFIG.tocSelector || 'h2, h3';
      const headings = document.querySelectorAll(`.article-content ${selector}`);
      headings.forEach(heading => {
        if (heading.id) {
          observer.observe(heading);
        }
      });
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TOCManager.init());
  } else {
    TOCManager.init();
  }
  
  // Export for use in other modules
  window.TOCManager = TOCManager;
  
})();

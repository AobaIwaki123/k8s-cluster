/**
 * Main JavaScript
 * k8s Cluster Documentation
 */

(function() {
  'use strict';
  
  /**
   * Scroll to Top Button
   */
  function initScrollToTop() {
    const scrollBtn = document.querySelector('.scroll-to-top');
    if (!scrollBtn) return;
    
    const threshold = CONFIG.scrollToTopThreshold || 300;
    
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > threshold) {
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.classList.remove('visible');
      }
    });
    
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  /**
   * External Links
   */
  function initExternalLinks() {
    const links = document.querySelectorAll('.article-content a');
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      
      // Check if it's an external link
      if (href && 
          (href.startsWith('http://') || href.startsWith('https://')) && 
          !href.includes(window.location.hostname)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }
  
  /**
   * Convert Blockquotes to Alerts
   */
  function enhanceBlockquotes() {
    const blockquotes = document.querySelectorAll('.article-content blockquote');
    
    blockquotes.forEach(blockquote => {
      const firstStrong = blockquote.querySelector('strong:first-child');
      
      if (firstStrong) {
        const text = firstStrong.textContent.toLowerCase();
        let alertClass = 'alert alert-info';
        let icon = 'fa-info-circle';
        
        if (text.includes('重要') || text.includes('important')) {
          alertClass = 'alert alert-warning';
          icon = 'fa-exclamation-triangle';
        } else if (text.includes('注意') || text.includes('warning') || text.includes('caution')) {
          alertClass = 'alert alert-danger';
          icon = 'fa-exclamation-circle';
        } else if (text.includes('成功') || text.includes('success') || text.includes('tip') || text.includes('ヒント')) {
          alertClass = 'alert alert-success';
          icon = 'fa-check-circle';
        }
        
        // Convert blockquote to alert
        const alertDiv = document.createElement('div');
        alertDiv.className = alertClass;
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'alert-icon';
        iconSpan.innerHTML = '<i class="fas ' + icon + '"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'alert-content';
        contentDiv.innerHTML = blockquote.innerHTML;
        
        alertDiv.appendChild(iconSpan);
        alertDiv.appendChild(contentDiv);
        
        blockquote.parentNode.replaceChild(alertDiv, blockquote);
      }
    });
  }
  
  /**
   * Animate Elements on Scroll
   */
  function initScrollAnimations() {
    const elements = document.querySelectorAll('.feature-card, .component-link');
    
    if (elements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(element);
    });
  }
  
  /**
   * Handle Hash Links on Page Load
   */
  function handleHashOnLoad() {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const element = document.getElementById(hash);
      
      if (element) {
        setTimeout(() => {
          const offset = CONFIG.scrollOffset || 80;
          const elementPosition = element.offsetTop;
          const offsetPosition = elementPosition - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }
  
  /**
   * Lazy Load Images
   */
  function initLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  }
  
  /**
   * Initialize All
   */
  function init() {
    console.log('🚀 k8s Cluster Documentation initialized');
    
    initScrollToTop();
    initExternalLinks();
    enhanceBlockquotes();
    initScrollAnimations();
    handleHashOnLoad();
    initLazyLoad();
    
    // Log current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    console.log('📦 Current theme:', currentTheme);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Re-initialize on page show (for bfcache)
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      console.log('Page restored from bfcache');
      init();
    }
  });
  
})();

/**
 * Page Transitions & Animations
 * k8s Cluster Documentation
 */

(function() {
  'use strict';
  
  const PageTransitions = {
    
    /**
     * Initialize page transitions
     */
    init() {
      this.animatePageLoad();
      this.animateElementsOnScroll();
      this.setupLinkTransitions();
    },
    
    /**
     * Animate page load
     */
    animatePageLoad() {
      // Add fade-in animation to main content
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(20px)';
        
        // Trigger animation after a short delay
        setTimeout(() => {
          mainContent.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
          mainContent.style.opacity = '1';
          mainContent.style.transform = 'translateY(0)';
        }, 100);
      }
      
      // Animate header
      const header = document.querySelector('.site-header');
      if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
          header.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
          header.style.opacity = '1';
          header.style.transform = 'translateY(0)';
        }, 50);
      }
      
      // Animate sidebar
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.style.opacity = '0';
        sidebar.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
          sidebar.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
          sidebar.style.opacity = '1';
          sidebar.style.transform = 'translateX(0)';
        }, 150);
      }
    },
    
    /**
     * Animate elements when they scroll into view
     */
    animateElementsOnScroll() {
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);
      
      // Observe elements with animation class
      const animateElements = document.querySelectorAll('.feature-card, .alert, .card, .code-block');
      animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
      });
    },
    
    /**
     * Setup smooth link transitions
     */
    setupLinkTransitions() {
      // Add click handler to internal links
      const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
      
      internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          // Skip if link has target="_blank"
          if (link.getAttribute('target') === '_blank') return;
          
          // Skip if it's an anchor link
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) return;
          
          // Add ripple effect
          this.createRippleEffect(e, link);
        });
      });
    },
    
    /**
     * Create ripple effect on click
     */
    createRippleEffect(e, element) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PageTransitions.init());
  } else {
    PageTransitions.init();
  }
  
  // Export for use in other modules
  window.PageTransitions = PageTransitions;
  
})();

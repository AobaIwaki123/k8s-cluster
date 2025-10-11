/**
 * Main JavaScript for k8s Cluster Documentation
 */

(function() {
  'use strict';

  // ================================================
  // Mobile Menu Toggle
  // ================================================
  
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');
  
  if (mobileMenuToggle && sidebar) {
    mobileMenuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInsideSidebar = sidebar.contains(event.target);
      const isClickOnToggle = mobileMenuToggle.contains(event.target);
      
      if (!isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
      }
    });
    
    // Close sidebar when clicking on a link (mobile)
    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 1024) {
          sidebar.classList.remove('active');
        }
      });
    });
  }

  // ================================================
  // Highlight Active Navigation Link
  // ================================================
  
  function highlightActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      const linkPath = link.getAttribute('href');
      
      if (linkPath && currentPath.endsWith(linkPath)) {
        link.classList.add('active');
      }
    });
  }
  
  highlightActiveNavLink();

  // ================================================
  // Scroll to Top Button
  // ================================================
  
  const scrollToTopBtn = document.getElementById('scrollToTop');
  
  if (scrollToTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    });
    
    scrollToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ================================================
  // Syntax Highlighting
  // ================================================
  
  if (typeof hljs !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
      // Highlight all code blocks
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
      
      // Add copy buttons to code blocks
      addCopyButtons();
    });
  }

  // ================================================
  // Copy Code Button
  // ================================================
  
  function addCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre');
    
    codeBlocks.forEach((pre, index) => {
      // Wrap pre in a div if not already wrapped
      if (!pre.parentElement.classList.contains('code-block-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('code-block-wrapper');
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
      }
      
      // Create copy button
      const button = document.createElement('button');
      button.classList.add('copy-button');
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      
      // Add click event
      button.addEventListener('click', function() {
        const code = pre.querySelector('code');
        const text = code ? code.textContent : pre.textContent;
        
        navigator.clipboard.writeText(text).then(function() {
          button.textContent = 'Copied!';
          button.classList.add('copied');
          
          setTimeout(function() {
            button.textContent = 'Copy';
            button.classList.remove('copied');
          }, 2000);
        }).catch(function(err) {
          console.error('Failed to copy:', err);
          button.textContent = 'Failed';
          
          setTimeout(function() {
            button.textContent = 'Copy';
          }, 2000);
        });
      });
      
      pre.parentElement.appendChild(button);
    });
  }

  // ================================================
  // Generate Table of Contents
  // ================================================
  
  function generateTableOfContents() {
    const toc = document.getElementById('toc');
    const content = document.querySelector('.page-content');
    
    if (!toc || !content) return;
    
    const headings = content.querySelectorAll('h2, h3');
    
    if (headings.length < 3) {
      // Don't show TOC if there are fewer than 3 headings
      toc.style.display = 'none';
      return;
    }
    
    const tocList = document.createElement('ul');
    tocList.classList.add('toc-list');
    
    const tocTitle = document.createElement('h4');
    tocTitle.textContent = '目次';
    tocTitle.classList.add('toc-title');
    
    headings.forEach((heading, index) => {
      // Add ID to heading if it doesn't have one
      if (!heading.id) {
        heading.id = 'heading-' + index;
      }
      
      const listItem = document.createElement('li');
      listItem.classList.add('toc-item');
      
      if (heading.tagName === 'H3') {
        listItem.classList.add('toc-item-h3');
      }
      
      const link = document.createElement('a');
      link.href = '#' + heading.id;
      link.textContent = heading.textContent;
      link.classList.add('toc-link');
      
      listItem.appendChild(link);
      tocList.appendChild(listItem);
    });
    
    toc.appendChild(tocTitle);
    toc.appendChild(tocList);
    
    // Smooth scroll for TOC links
    const tocLinks = toc.querySelectorAll('.toc-link');
    tocLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 80; // Account for fixed header
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }
  
  // Run on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
    generateTableOfContents();
  });

  // ================================================
  // Smooth Scrolling for Anchor Links
  // ================================================
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Skip if href is just "#"
      if (href === '#') return;
      
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ================================================
  // External Link Icons
  // ================================================
  
  document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.page-content a');
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      
      // Check if it's an external link
      if (href && (href.startsWith('http://') || href.startsWith('https://')) && !href.includes(window.location.hostname)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        
        // Add external link icon
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-external-link-alt');
        icon.style.fontSize = '0.75em';
        icon.style.marginLeft = '0.25em';
        icon.style.opacity = '0.6';
        link.appendChild(icon);
      }
    });
  });

  // ================================================
  // Add Language Labels to Code Blocks
  // ================================================
  
  document.addEventListener('DOMContentLoaded', function() {
    const codeBlocks = document.querySelectorAll('pre code[class*="language-"]');
    
    codeBlocks.forEach(code => {
      const pre = code.parentElement;
      const classes = code.className.split(' ');
      const languageClass = classes.find(cls => cls.startsWith('language-'));
      
      if (languageClass) {
        const language = languageClass.replace('language-', '');
        const label = document.createElement('div');
        label.classList.add('code-language-label');
        label.textContent = language;
        
        // Add styles
        label.style.cssText = `
          position: absolute;
          top: 0.5rem;
          left: 1rem;
          font-size: 0.75rem;
          font-family: var(--font-mono);
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        `;
        
        if (pre.parentElement.classList.contains('code-block-wrapper')) {
          pre.parentElement.appendChild(label);
        }
      }
    });
  });

  // ================================================
  // Animate Elements on Scroll
  // ================================================
  
  function animateOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .component-link');
    
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
  
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
      animateOnScroll();
    }
  });

  // ================================================
  // Enhanced Blockquotes (Convert to Alerts)
  // ================================================
  
  document.addEventListener('DOMContentLoaded', function() {
    const blockquotes = document.querySelectorAll('.page-content blockquote');
    
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
        } else if (text.includes('成功') || text.includes('success') || text.includes('tip')) {
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
        contentDiv.innerHTML = blockquote.innerHTML;
        
        alertDiv.appendChild(iconSpan);
        alertDiv.appendChild(contentDiv);
        
        blockquote.parentNode.replaceChild(alertDiv, blockquote);
      }
    });
  });

  // ================================================
  // Search Functionality (placeholder for future)
  // ================================================
  
  // TODO: Add search functionality if needed

})();

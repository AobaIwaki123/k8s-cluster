/**
 * Code Highlighting and Copy Functionality
 * k8s Cluster Documentation
 */

(function() {
  'use strict';
  
  const CodeManager = {
    
    /**
     * Initialize code features
     */
    init() {
      this.highlightCode();
      this.addCopyButtons();
      this.addLanguageLabels();
    },
    
    /**
     * Highlight code blocks
     */
    highlightCode() {
      if (typeof hljs === 'undefined') {
        console.warn('highlight.js not loaded');
        return;
      }
      
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    },
    
    /**
     * Add copy buttons to code blocks
     */
    addCopyButtons() {
      const codeBlocks = document.querySelectorAll('pre');
      
      codeBlocks.forEach((pre) => {
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
        button.innerHTML = '<i class="fas fa-copy"></i> Copy';
        button.setAttribute('aria-label', 'Copy code to clipboard');
        
        // Add click event
        button.addEventListener('click', () => {
          this.copyCode(pre, button);
        });
        
        pre.parentElement.appendChild(button);
      });
    },
    
    /**
     * Copy code to clipboard
     */
    async copyCode(pre, button) {
      const code = pre.querySelector('code');
      const text = code ? code.textContent : pre.textContent;
      
      try {
        await navigator.clipboard.writeText(text);
        
        // Update button state
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.classList.add('copied');
        
        // Reset button after 2 seconds
        setTimeout(() => {
          button.innerHTML = '<i class="fas fa-copy"></i> Copy';
          button.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        button.innerHTML = '<i class="fas fa-times"></i> Failed';
        
        setTimeout(() => {
          button.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
      }
    },
    
    /**
     * Add language labels to code blocks
     */
    addLanguageLabels() {
      const codeBlocks = document.querySelectorAll('pre code[class*="language-"]');
      
      codeBlocks.forEach(code => {
        const pre = code.parentElement;
        const classes = code.className.split(' ');
        const languageClass = classes.find(cls => cls.startsWith('language-'));
        
        if (languageClass) {
          const language = languageClass.replace('language-', '');
          
          // Check if label already exists
          if (pre.parentElement.querySelector('.code-language-label')) {
            return;
          }
          
          const label = document.createElement('div');
          label.classList.add('code-language-label');
          label.textContent = language;
          
          if (pre.parentElement.classList.contains('code-block-wrapper')) {
            pre.parentElement.insertBefore(label, pre);
          }
        }
      });
    },
    
    /**
     * Re-initialize (useful after dynamic content loading)
     */
    reinit() {
      this.init();
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CodeManager.init());
  } else {
    CodeManager.init();
  }
  
  // Export for use in other modules
  window.CodeManager = CodeManager;
  
})();

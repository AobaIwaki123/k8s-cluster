// ============================================================================
// Theme Toggle (Dark Mode)
// ============================================================================

function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  
  // Get saved theme or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  const themeToggle = document.getElementById('theme-toggle');
  const icon = themeToggle.querySelector('i');
  
  if (theme === 'dark') {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
}

// ============================================================================
// Mobile Menu Toggle
// ============================================================================

function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
      }
    });
    
    // Close menu when clicking a link
    const mobileNavLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
      });
    });
  }
}

// ============================================================================
// Syntax Highlighting
// ============================================================================

function initSyntaxHighlighting() {
  // Highlight all code blocks
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
  
  // Add copy button to code blocks
  document.querySelectorAll('pre').forEach((pre) => {
    const code = pre.querySelector('code');
    if (code) {
      const copyButton = createCopyButton();
      pre.style.position = 'relative';
      pre.appendChild(copyButton);
      
      copyButton.addEventListener('click', () => {
        const text = code.textContent;
        navigator.clipboard.writeText(text).then(() => {
          const originalText = copyButton.innerHTML;
          copyButton.innerHTML = '<i class="fas fa-check"></i>';
          copyButton.style.backgroundColor = 'var(--color-success)';
          
          setTimeout(() => {
            copyButton.innerHTML = originalText;
            copyButton.style.backgroundColor = '';
          }, 2000);
        });
      });
    }
  });
}

function createCopyButton() {
  const button = document.createElement('button');
  button.className = 'copy-button';
  button.innerHTML = '<i class="fas fa-copy"></i>';
  button.setAttribute('aria-label', 'コードをコピー');
  
  const style = document.createElement('style');
  style.textContent = `
    .copy-button {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      padding: 0.5rem;
      background-color: var(--color-bg-tertiary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-secondary);
      cursor: pointer;
      font-size: 0.875rem;
      transition: all var(--transition-fast);
      opacity: 0;
      z-index: 10;
    }
    
    pre:hover .copy-button {
      opacity: 1;
    }
    
    .copy-button:hover {
      background-color: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }
    
    .copy-button:active {
      transform: scale(0.95);
    }
  `;
  
  if (!document.querySelector('style[data-copy-button]')) {
    style.setAttribute('data-copy-button', 'true');
    document.head.appendChild(style);
  }
  
  return button;
}

// ============================================================================
// Smooth Scroll for Anchor Links
// ============================================================================

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

// ============================================================================
// Add Table of Contents (if needed)
// ============================================================================

function generateTableOfContents() {
  const article = document.querySelector('.article-body');
  if (!article) return;
  
  const headings = article.querySelectorAll('h2, h3');
  if (headings.length < 3) return; // Only show TOC if there are at least 3 headings
  
  const toc = document.createElement('div');
  toc.className = 'table-of-contents';
  toc.innerHTML = '<h3><i class="fas fa-list"></i> 目次</h3><ul class="toc-list"></ul>';
  
  const tocList = toc.querySelector('.toc-list');
  
  headings.forEach((heading, index) => {
    const id = `heading-${index}`;
    heading.id = id;
    
    const li = document.createElement('li');
    li.className = heading.tagName === 'H3' ? 'toc-item-sub' : 'toc-item';
    
    const a = document.createElement('a');
    a.href = `#${id}`;
    a.textContent = heading.textContent;
    
    li.appendChild(a);
    tocList.appendChild(li);
  });
  
  // Add TOC style
  const tocStyle = document.createElement('style');
  tocStyle.textContent = `
    .table-of-contents {
      background-color: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      margin: var(--spacing-xl) 0;
    }
    
    .table-of-contents h3 {
      margin: 0 0 var(--spacing-md) 0;
      font-size: var(--font-size-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
    
    .table-of-contents h3 i {
      color: var(--color-primary);
    }
    
    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .toc-item {
      margin-bottom: var(--spacing-xs);
    }
    
    .toc-item-sub {
      margin-bottom: var(--spacing-xs);
      padding-left: var(--spacing-lg);
    }
    
    .toc-list a {
      display: block;
      padding: var(--spacing-xs) var(--spacing-sm);
      color: var(--color-text);
      text-decoration: none;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      font-size: var(--font-size-sm);
    }
    
    .toc-list a:hover {
      color: var(--color-primary);
      background-color: var(--color-bg);
      padding-left: var(--spacing-md);
    }
  `;
  
  if (!document.querySelector('style[data-toc]')) {
    tocStyle.setAttribute('data-toc', 'true');
    document.head.appendChild(tocStyle);
  }
  
  // Insert TOC after the first paragraph or heading
  const firstParagraph = article.querySelector('p');
  if (firstParagraph) {
    firstParagraph.after(toc);
  } else {
    article.prepend(toc);
  }
}

// ============================================================================
// Add Animations on Scroll
// ============================================================================

function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all major content blocks
  document.querySelectorAll('.article-body > *').forEach(el => {
    observer.observe(el);
  });
}

// ============================================================================
// External Link Icons
// ============================================================================

function addExternalLinkIcons() {
  const links = document.querySelectorAll('.article-body a[href^="http"]');
  links.forEach(link => {
    if (!link.hostname.includes(window.location.hostname)) {
      link.innerHTML += ' <i class="fas fa-external-link-alt" style="font-size: 0.75em; opacity: 0.6;"></i>';
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

// ============================================================================
// Initialize All Features
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initSyntaxHighlighting();
  initSmoothScroll();
  generateTableOfContents();
  initScrollAnimations();
  addExternalLinkIcons();
  
  console.log('📚 Documentation site initialized!');
});

// ============================================================================
// Handle Page Visibility for Performance
// ============================================================================

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden - pause animations if needed
  } else {
    // Page is visible - resume animations
  }
});

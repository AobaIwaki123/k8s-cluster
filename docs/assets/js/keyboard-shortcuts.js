/**
 * Keyboard Shortcuts
 * k8s Cluster Documentation
 */

(function() {
  'use strict';
  
  const KeyboardShortcuts = {
    shortcuts: {
      // Search (already implemented in search.js)
      'ctrl+k': () => {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      'cmd+k': () => {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      
      // Theme toggle
      't': () => {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
          themeToggle.click();
        }
      },
      
      // Navigation
      'g+h': () => {
        window.location.href = '/';
      },
      
      // Previous/Next page navigation
      'p': () => {
        const prevLink = document.querySelector('.page-nav-prev');
        if (prevLink) {
          window.location.href = prevLink.getAttribute('href');
        }
      },
      'n': () => {
        const nextLink = document.querySelector('.page-nav-next');
        if (nextLink) {
          window.location.href = nextLink.getAttribute('href');
        }
      },
      
      // Scroll to top
      'shift+t': () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      },
      
      // Scroll to bottom
      'shift+b': () => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      },
      
      // Toggle sidebar (mobile)
      'm': () => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && window.innerWidth <= 1024) {
          if (window.NavigationManager) {
            window.NavigationManager.toggleSidebar();
          }
        }
      },
      
      // Show keyboard shortcuts help
      '?': () => {
        this.showShortcutsHelp();
      }
    },
    
    keysPressed: new Set(),
    
    /**
     * Initialize keyboard shortcuts
     */
    init() {
      this.setupKeyboardListener();
      this.createShortcutsHelpModal();
    },
    
    /**
     * Setup keyboard event listeners
     */
    setupKeyboardListener() {
      document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in input fields
        if (this.isTypingInInput(e.target)) {
          // Exception: Allow Ctrl+K and Cmd+K even in input fields
          if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.handleShortcut('ctrl+k');
          }
          return;
        }
        
        // Build shortcut key string
        const key = this.buildShortcutKey(e);
        
        // Handle sequence shortcuts (like g+h)
        if (key === 'g') {
          this.keysPressed.add('g');
          setTimeout(() => {
            this.keysPressed.delete('g');
          }, 1000);
          return;
        }
        
        if (this.keysPressed.has('g')) {
          const sequenceKey = 'g+' + key;
          if (this.shortcuts[sequenceKey]) {
            e.preventDefault();
            this.handleShortcut(sequenceKey);
            this.keysPressed.clear();
            return;
          }
        }
        
        // Handle regular shortcuts
        if (this.shortcuts[key]) {
          e.preventDefault();
          this.handleShortcut(key);
        }
      });
    },
    
    /**
     * Build shortcut key string from event
     */
    buildShortcutKey(e) {
      const parts = [];
      
      if (e.ctrlKey) parts.push('ctrl');
      if (e.metaKey) parts.push('cmd');
      if (e.shiftKey && e.key !== 'Shift') parts.push('shift');
      if (e.altKey) parts.push('alt');
      
      const key = e.key.toLowerCase();
      if (key !== 'control' && key !== 'meta' && key !== 'shift' && key !== 'alt') {
        parts.push(key);
      }
      
      return parts.join('+');
    },
    
    /**
     * Check if user is typing in an input field
     */
    isTypingInInput(element) {
      const tagName = element.tagName.toLowerCase();
      return (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        element.isContentEditable
      );
    },
    
    /**
     * Handle shortcut execution
     */
    handleShortcut(key) {
      const handler = this.shortcuts[key];
      if (handler && typeof handler === 'function') {
        handler();
      }
    },
    
    /**
     * Create shortcuts help modal
     */
    createShortcutsHelpModal() {
      // Check if modal already exists
      if (document.querySelector('.shortcuts-help-modal')) return;
      
      const modal = document.createElement('div');
      modal.className = 'shortcuts-help-modal';
      modal.innerHTML = `
        <div class="shortcuts-help-overlay"></div>
        <div class="shortcuts-help-content">
          <div class="shortcuts-help-header">
            <h2>キーボードショートカット</h2>
            <button class="shortcuts-help-close" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="shortcuts-help-body">
            <div class="shortcuts-section">
              <h3>検索</h3>
              <div class="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>K</kbd> または <kbd>Cmd</kbd> + <kbd>K</kbd>
                <span>検索フォーカス</span>
              </div>
            </div>
            
            <div class="shortcuts-section">
              <h3>ナビゲーション</h3>
              <div class="shortcut-item">
                <kbd>G</kbd> + <kbd>H</kbd>
                <span>ホームに移動</span>
              </div>
              <div class="shortcut-item">
                <kbd>P</kbd>
                <span>前のページ</span>
              </div>
              <div class="shortcut-item">
                <kbd>N</kbd>
                <span>次のページ</span>
              </div>
            </div>
            
            <div class="shortcuts-section">
              <h3>表示</h3>
              <div class="shortcut-item">
                <kbd>T</kbd>
                <span>テーマ切り替え</span>
              </div>
              <div class="shortcut-item">
                <kbd>M</kbd>
                <span>サイドバー切り替え（モバイル）</span>
              </div>
            </div>
            
            <div class="shortcuts-section">
              <h3>スクロール</h3>
              <div class="shortcut-item">
                <kbd>Shift</kbd> + <kbd>T</kbd>
                <span>ページトップへ</span>
              </div>
              <div class="shortcut-item">
                <kbd>Shift</kbd> + <kbd>B</kbd>
                <span>ページボトムへ</span>
              </div>
            </div>
            
            <div class="shortcuts-section">
              <h3>ヘルプ</h3>
              <div class="shortcut-item">
                <kbd>?</kbd>
                <span>このヘルプを表示</span>
              </div>
              <div class="shortcut-item">
                <kbd>Esc</kbd>
                <span>モーダルを閉じる</span>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Close handlers
      const closeBtn = modal.querySelector('.shortcuts-help-close');
      const overlay = modal.querySelector('.shortcuts-help-overlay');
      
      closeBtn.addEventListener('click', () => this.hideShortcutsHelp());
      overlay.addEventListener('click', () => this.hideShortcutsHelp());
      
      // ESC key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          this.hideShortcutsHelp();
        }
      });
    },
    
    /**
     * Show shortcuts help modal
     */
    showShortcutsHelp() {
      const modal = document.querySelector('.shortcuts-help-modal');
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    },
    
    /**
     * Hide shortcuts help modal
     */
    hideShortcutsHelp() {
      const modal = document.querySelector('.shortcuts-help-modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => KeyboardShortcuts.init());
  } else {
    KeyboardShortcuts.init();
  }
  
  // Export for use in other modules
  window.KeyboardShortcuts = KeyboardShortcuts;
  
})();

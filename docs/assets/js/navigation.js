/**
 * Navigation Management
 * k8s Cluster Documentation
 */

(function () {
  "use strict";

  const NavigationManager = {
    // Flag to track if close button listener is set up
    closeButtonListenerSet: false,

    /**
     * Initialize navigation
     */
    init() {
      this.setupMobileMenu();
      this.highlightActiveLink();
      this.setupSmoothScroll();
      this.renderSidebar();
    },

    /**
     * Setup mobile menu toggle
     */
    setupMobileMenu() {
      const toggle = document.querySelector(".mobile-menu-toggle");
      const sidebar = document.querySelector(".sidebar");
      const overlay = document.querySelector(".sidebar-overlay");

      if (!toggle || !sidebar) return;

      // Create overlay if it doesn't exist
      if (!overlay) {
        const newOverlay = document.createElement("div");
        newOverlay.className = "sidebar-overlay";
        document.body.appendChild(newOverlay);
      }

      // Toggle sidebar
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleSidebar();
      });

      // Prevent sidebar clicks from closing
      sidebar.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      // Close on overlay click and touch
      const currentOverlay = document.querySelector(".sidebar-overlay");
      if (currentOverlay) {
        const closeOnOverlay = () => {
          this.closeSidebar();
        };

        currentOverlay.addEventListener("click", closeOnOverlay);
        currentOverlay.addEventListener("touchend", closeOnOverlay);
      }

      // Close on link click (mobile)
      const sidebarLinks = sidebar.querySelectorAll(".nav-link");
      sidebarLinks.forEach((link) => {
        link.addEventListener("click", () => {
          if (window.innerWidth <= 1024) {
            this.closeSidebar();
          }
        });
      });

      // Close on ESC key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.closeSidebar();
        }
      });
    },

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
      const sidebar = document.querySelector(".sidebar");
      const overlay = document.querySelector(".sidebar-overlay");

      if (sidebar) {
        sidebar.classList.toggle("active");
      }

      if (overlay) {
        overlay.classList.toggle("active");
      }

      // Prevent body scroll when sidebar is open
      if (sidebar && sidebar.classList.contains("active")) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    },

    /**
     * Close sidebar
     */
    closeSidebar() {
      const sidebar = document.querySelector(".sidebar");
      const overlay = document.querySelector(".sidebar-overlay");

      if (sidebar) {
        sidebar.classList.remove("active");
      }

      if (overlay) {
        overlay.classList.remove("active");
      }

      document.body.style.overflow = "";
    },

    /**
     * Highlight active navigation link
     */
    highlightActiveLink() {
      const currentPath = window.location.pathname;
      const navLinks = document.querySelectorAll(".nav-link");

      navLinks.forEach((link) => {
        link.classList.remove("active");
        const linkPath = link.getAttribute("href");

        if (linkPath && currentPath.endsWith(linkPath)) {
          link.classList.add("active");
        }
      });
    },

    /**
     * Setup smooth scrolling
     */
    setupSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
          const href = anchor.getAttribute("href");

          // Skip if href is just "#"
          if (href === "#") return;

          e.preventDefault();
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            const offset = CONFIG.scrollOffset || 80;
            const elementPosition = targetElement.offsetTop;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });

            // Update URL without jumping
            history.pushState(null, null, href);
          }
        });
      });
    },

    /**
     * Get base path for navigation
     */
    getBasePath() {
      const basePath = CONFIG.basePath || "";

      // For GitHub Pages, always use the basePath
      if (basePath) {
        return basePath + "/";
      }

      // For local development, use relative paths
      const currentPath = window.location.pathname;
      const pathSegments = currentPath
        .split("/")
        .filter((s) => s && s !== "index.html");
      const depth = pathSegments.length;

      // If we're at root (docs/index.html), return empty
      if (
        depth === 0 ||
        currentPath.endsWith("/docs/") ||
        currentPath.endsWith("/docs/index.html")
      ) {
        return "";
      }

      // For each level deep, add '../'
      return "../".repeat(depth) || "./";
    },

    /**
     * Render sidebar navigation
     */
    renderSidebar() {
      const sidebar = document.querySelector(".sidebar");
      if (!sidebar || !CONFIG.navigation) return;

      // Check if navigation is already rendered
      if (sidebar.querySelector(".nav-section")) return;

      const basePath = this.getBasePath();
      let html = "";

      // Add close button for mobile
      html += `
        <button class="sidebar-close" aria-label="Close sidebar">
          <i class="fas fa-times"></i>
        </button>
      `;

      // Render navigation sections
      CONFIG.navigation.forEach((section) => {
        html += `
          <div class="nav-section">
            <h3 class="nav-section-title">
              <i class="fas ${section.icon} nav-section-icon"></i>
              ${section.title}
            </h3>
            <ul class="nav-list">
        `;

        section.items.forEach((item) => {
          // Prepend basePath to all URLs
          const url = basePath + item.url;
          html += `
              <li class="nav-item">
                <a href="${url}" class="nav-link">${item.title}</a>
              </li>
          `;
        });

        html += `
            </ul>
          </div>
        `;
      });

      // Add version info if available
      if (CONFIG.versions && CONFIG.versions.length > 0) {
        html += `
          <div class="nav-section">
            <h3 class="nav-section-title">
              <i class="fas fa-info-circle nav-section-icon"></i>
              バージョン
            </h3>
            <div class="version-info">
        `;

        CONFIG.versions.forEach((version) => {
          html += `
              <div class="version-item">
                <span class="version-label">${version.label}</span>
                <span class="version-number">${version.version}</span>
              </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
      }

      sidebar.innerHTML = html;

      // Re-highlight active link after rendering
      this.highlightActiveLink();

      // Setup close button
      this.setupSidebarCloseButton();
    },

    /**
     * Setup sidebar close button
     */
    setupSidebarCloseButton() {
      // Only set up the listener once to prevent duplicates
      if (this.closeButtonListenerSet) return;

      const sidebar = document.querySelector(".sidebar");
      if (!sidebar) return;

      // Use event delegation on the sidebar to handle close button clicks
      // This ensures the event listener works even after sidebar content is re-rendered
      sidebar.addEventListener("click", (e) => {
        const closeBtn = e.target.closest(".sidebar-close");
        if (closeBtn) {
          e.stopPropagation();
          e.preventDefault();
          this.closeSidebar();
        }
      });

      this.closeButtonListenerSet = true;
    },

    /**
     * Render breadcrumb
     */
    renderBreadcrumb() {
      const breadcrumb = document.querySelector(".breadcrumb");
      if (!breadcrumb) return;

      const path = window.location.pathname;
      const segments = path.split("/").filter((s) => s && s !== "index.html");

      if (segments.length === 0) return;

      let html = `
        <div class="breadcrumb-item">
          <a href="/" class="breadcrumb-link">
            <i class="fas fa-home"></i> Home
          </a>
        </div>
      `;

      let currentPath = "";
      segments.forEach((segment, index) => {
        currentPath += "/" + segment;
        const isLast = index === segments.length - 1;
        const name = segment.replace(".html", "").replace(/-/g, " ");
        const displayName = name.charAt(0).toUpperCase() + name.slice(1);

        html += `
          <span class="breadcrumb-separator">/</span>
        `;

        if (isLast) {
          html += `
            <div class="breadcrumb-item">
              <span class="breadcrumb-current">${displayName}</span>
            </div>
          `;
        } else {
          html += `
            <div class="breadcrumb-item">
              <a href="${currentPath}" class="breadcrumb-link">${displayName}</a>
            </div>
          `;
        }
      });

      breadcrumb.innerHTML = html;
    },
  };

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      NavigationManager.init()
    );
  } else {
    NavigationManager.init();
  }

  // Export for use in other modules
  window.NavigationManager = NavigationManager;
})();

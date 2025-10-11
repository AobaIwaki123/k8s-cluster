/**
 * Page Navigation (Previous/Next)
 * k8s Cluster Documentation
 */

(function () {
  "use strict";

  const PageNavigation = {
    /**
     * Initialize page navigation
     */
    init() {
      if (!CONFIG.navigation) return;
      this.renderPageNavigation();
    },

    /**
     * Get all pages in order from navigation config
     */
    getAllPages() {
      const pages = [];

      // Add home page
      pages.push({
        title: "ホーム",
        url: "/",
        section: "ホーム",
      });

      // Add pages from navigation sections
      CONFIG.navigation.forEach((section) => {
        section.items.forEach((item) => {
          pages.push({
            title: item.title,
            url: item.url,
            section: section.title,
          });
        });
      });

      return pages;
    },

    /**
     * Get current page info
     */
    getCurrentPage() {
      const currentPath = window.location.pathname;
      const pages = this.getAllPages();

      // Find current page index
      const currentIndex = pages.findIndex((page) => {
        // Match exact path or path without leading slash
        return (
          currentPath.endsWith(page.url) ||
          currentPath === page.url ||
          (currentPath === "/" && page.url === "/") ||
          (currentPath.endsWith("/index.html") && page.url === "/")
        );
      });

      return {
        currentIndex,
        pages,
        hasPrevious: currentIndex > 0,
        hasNext: currentIndex >= 0 && currentIndex < pages.length - 1,
      };
    },

    /**
     * Render page navigation (Previous/Next buttons)
     */
    renderPageNavigation() {
      // Find or create container at the end of article
      const article = document.querySelector(".article-content");
      if (!article) return;

      const pageInfo = this.getCurrentPage();
      if (pageInfo.currentIndex === -1) return; // Page not found in navigation

      // Don't show on home page
      if (
        window.location.pathname === "/" ||
        window.location.pathname.endsWith("/index.html")
      ) {
        return;
      }

      // Check if navigation already exists
      if (article.querySelector(".page-navigation")) return;

      // Create navigation container
      const nav = document.createElement("nav");
      nav.className = "page-navigation";

      let html = '<div class="page-nav-container">';

      // Previous page
      if (pageInfo.hasPrevious) {
        const prevPage = pageInfo.pages[pageInfo.currentIndex - 1];
        html += `
          <a href="${prevPage.url}" class="page-nav-link page-nav-prev">
            <span class="page-nav-direction">
              <i class="fas fa-arrow-left"></i>
              <span class="page-nav-label">前へ</span>
            </span>
            <span class="page-nav-info">
              <span class="page-nav-section">${prevPage.section}</span>
              <span class="page-nav-title">${prevPage.title}</span>
            </span>
          </a>
        `;
      } else {
        html += '<div class="page-nav-spacer"></div>';
      }

      // Next page
      if (pageInfo.hasNext) {
        const nextPage = pageInfo.pages[pageInfo.currentIndex + 1];
        html += `
          <a href="${nextPage.url}" class="page-nav-link page-nav-next">
            <span class="page-nav-info">
              <span class="page-nav-section">${nextPage.section}</span>
              <span class="page-nav-title">${nextPage.title}</span>
            </span>
            <span class="page-nav-direction">
              <span class="page-nav-label">次へ</span>
              <i class="fas fa-arrow-right"></i>
            </span>
          </a>
        `;
      } else {
        html += '<div class="page-nav-spacer"></div>';
      }

      html += "</div>";
      nav.innerHTML = html;

      // Insert navigation after article content
      article.appendChild(nav);
    },
  };

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => PageNavigation.init());
  } else {
    PageNavigation.init();
  }

  // Export for use in other modules
  window.PageNavigation = PageNavigation;
})();

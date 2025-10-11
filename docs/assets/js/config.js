/**
 * Configuration
 * k8s Cluster Documentation
 */

const CONFIG = {
  // Site info
  siteTitle: "k8s Cluster on Proxmox",

  // Base path for GitHub Pages (set to '' for root domain)
  basePath: "",

  // Navigation structure
  navigation: [
    {
      title: "はじめに",
      icon: "fa-rocket",
      items: [
        { title: "前準備", url: "k8s-cluster/setup/prerequisites.html" },
        {
          title: "クラスター構築",
          url: "k8s-cluster/setup/cluster-installation.html",
        },
      ],
    },
    {
      title: "コンポーネント",
      icon: "fa-puzzle-piece",
      items: [
        { title: "ArgoCD", url: "k8s-cluster/components/argocd.html" },
        {
          title: "Cloudflare Ingress",
          url: "k8s-cluster/components/cloudflare-ingress.html",
        },
        { title: "Rook Ceph", url: "k8s-cluster/components/rook-ceph.html" },
        {
          title: "Cert Manager",
          url: "k8s-cluster/components/cert-manager.html",
        },
        { title: "Harbor", url: "k8s-cluster/components/harbor.html" },
      ],
    },
  ],

  // Version info
  versions: [
    { label: "asdf", version: "v0.16.6" },
    { label: "k0sctl", version: "v0.23.0" },
    { label: "kubectl", version: "1.32.3" },
    { label: "helm", version: "3.17.2" },
    { label: "argocd", version: "2.14.7" },
  ],

  // Theme
  defaultTheme: "light", // 'light' or 'dark'

  // Code highlight
  highlightLanguages: ["bash", "yaml", "javascript", "python", "go"],

  // Search
  searchEnabled: true,
  searchPlaceholder: "検索... (Ctrl+K)",

  // TOC
  tocMinHeadings: 3, // Minimum number of headings to show TOC
  tocSelector: "h2, h3", // Headings to include in TOC

  // Scroll
  scrollOffset: 80, // Offset for smooth scroll (header height + padding)
  scrollToTopThreshold: 300, // Show scroll-to-top button after this many pixels
};

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}

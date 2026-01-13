import { defineConfig, type HeadConfig } from "vitepress";
import { generateRssFeed } from "./rss";

const siteUrl = "https://multivac42.com";

export default defineConfig({
  buildEnd: generateRssFeed,
  title: "Multivac 42",
  description: "研究與寫作 - 探索商業、科技與產業的深度分析",
  lang: "zh-TW",
  srcDir: "docs",
  cleanUrls: true,
  ignoreDeadLinks: true,

  // Sitemap for Search Console
  sitemap: {
    hostname: siteUrl,
  },

  // P-01: 圖片懶載入
  markdown: {
    image: {
      lazyLoading: true,
    },
  },

  head: [
    // Google Analytics 4
    [
      "script",
      {
        async: "",
        src: "https://www.googletagmanager.com/gtag/js?id=G-XX4BDZCE2H",
      },
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XX4BDZCE2H');`,
    ],
    // B-01: Favicon 完整組
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],
    ["meta", { name: "theme-color", content: "#f59e0b" }],
    [
      "link",
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "Multivac 42 RSS",
        href: "/feed.xml",
      },
    ],
    ["meta", { property: "og:site_name", content: "Multivac 42" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "zh_TW" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
  ],

  transformPageData(pageData) {
    // Generate dynamic meta tags for each page
    const title = pageData.frontmatter.title || pageData.title;
    const description =
      pageData.frontmatter.description || "探索商業、科技與產業的深度分析";
    const cover = pageData.frontmatter.cover;
    const date = pageData.frontmatter.date;
    const author = pageData.frontmatter.author || "Clement Tang";
    const url = `${siteUrl}/${pageData.relativePath.replace(/\.md$/, "").replace(/index$/, "")}`;

    const head: HeadConfig[] = [
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: description }],
      ["meta", { property: "og:url", content: url }],
      ["meta", { name: "twitter:title", content: title }],
      ["meta", { name: "twitter:description", content: description }],
    ];

    if (cover) {
      const imageUrl = cover.startsWith("http") ? cover : `${siteUrl}${cover}`;
      head.push(["meta", { property: "og:image", content: imageUrl }]);
      head.push(["meta", { name: "twitter:image", content: imageUrl }]);
    }

    // Add Article Schema for article pages
    const isArticle =
      pageData.relativePath.startsWith("articles/") ||
      pageData.relativePath.startsWith("research/") ||
      pageData.relativePath.startsWith("company-research/");

    if (isArticle && !pageData.relativePath.endsWith("index.md") && date) {
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description: description,
        author: {
          "@type": "Person",
          name: author,
        },
        datePublished: date,
        dateModified: pageData.frontmatter.lastModified || date,
        publisher: {
          "@type": "Organization",
          name: "Multivac 42",
          url: siteUrl,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        ...(cover && {
          image: cover.startsWith("http") ? cover : `${siteUrl}${cover}`,
        }),
      };

      head.push([
        "script",
        { type: "application/ld+json" },
        JSON.stringify(articleSchema),
      ]);
    }

    pageData.frontmatter.head = [...(pageData.frontmatter.head || []), ...head];
  },

  themeConfig: {
    nav: [
      { text: "首頁", link: "/" },
      { text: "文章", link: "/articles/" },
      { text: "公司研究", link: "/company-research/" },
      { text: "主題研究", link: "/research/" },
      { text: "標籤", link: "/tags" },
      { text: "關於", link: "/about" },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/Clementtang/multivac42" },
    ],

    outline: {
      label: "本頁目錄",
    },

    search: {
      provider: "local",
    },

    footer: {
      message: "以 VitePress 建置",
      copyright: "© 2025 Clement Tang",
    },
  },
});

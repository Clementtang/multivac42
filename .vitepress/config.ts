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

  // P-01: 圖片懶載入 + F-05: 深色程式碼主題
  markdown: {
    image: {
      lazyLoading: true,
    },
    theme: {
      light: "github-light",
      dark: "github-dark-dimmed",
    },
  },

  head: [
    // P-03: Preconnect to Google Fonts
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    [
      "link",
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap",
      },
    ],
    // X (Twitter) embeds
    [
      "script",
      {
        async: "",
        src: "https://platform.twitter.com/widgets.js",
        charset: "utf-8",
      },
    ],
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
      // SEO-04: Canonical URL
      ["link", { rel: "canonical", href: url }],
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

    // ============================================
    // SD-04: WebSite Schema（僅首頁）
    // ============================================
    const isHomePage = pageData.relativePath === "index.md";

    if (isHomePage) {
      const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Multivac 42",
        alternateName: "研究與寫作",
        url: siteUrl,
        description: "探索商業、科技與產業的深度分析",
        inLanguage: "zh-TW",
        publisher: {
          "@type": "Organization",
          name: "Multivac 42",
          url: siteUrl,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      };

      head.push([
        "script",
        { type: "application/ld+json" },
        JSON.stringify(websiteSchema),
      ]);
    }

    // ============================================
    // SD-03: BreadcrumbList Schema（所有頁面）
    // ============================================
    const pathNameMap: Record<string, string> = {
      articles: "文章",
      "company-research": "公司研究",
      research: "主題研究",
      "topic-research": "主題研究",
      tags: "標籤",
      about: "關於",
    };

    const companyNameMap: Record<string, string> = {
      "luckin-coffee": "瑞幸咖啡",
      toast: "Toast",
      airwallex: "Airwallex",
      hotai: "和泰汽車",
      "manus-ai": "Manus AI",
    };

    function generateBreadcrumbItems() {
      const items: Array<{
        "@type": string;
        position: number;
        name: string;
        item: string;
      }> = [];

      // 首頁永遠是第一項
      items.push({
        "@type": "ListItem",
        position: 1,
        name: "首頁",
        item: siteUrl,
      });

      // 處理路徑
      const cleanPath = pageData.relativePath
        .replace(/\.md$/, "")
        .replace(/\/index$/, "")
        .replace(/^index$/, "");

      if (!cleanPath) {
        return items;
      }

      const segments = cleanPath.split("/");
      let currentPath = "";
      let position = 2;

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        currentPath += `/${segment}`;
        const isLastSegment = i === segments.length - 1;

        let displayName: string;

        if (pathNameMap[segment]) {
          displayName = pathNameMap[segment];
        } else if (
          i === 1 &&
          segments[0] === "company-research" &&
          companyNameMap[segment]
        ) {
          displayName = companyNameMap[segment];
        } else if (isLastSegment) {
          displayName = title;
        } else {
          displayName = segment;
        }

        items.push({
          "@type": "ListItem",
          position: position,
          name: displayName,
          item: `${siteUrl}${currentPath}`,
        });

        position++;
      }

      return items;
    }

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: generateBreadcrumbItems(),
    };

    head.push([
      "script",
      { type: "application/ld+json" },
      JSON.stringify(breadcrumbSchema),
    ]);

    // ============================================
    // SD-01: Article Schema（文章頁面）
    // ============================================
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
        // SD-02: 完整 Person Schema
        author: {
          "@type": "Person",
          name: author,
          url: `${siteUrl}/about`,
          sameAs: ["https://github.com/Clementtang"],
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
      { text: "主題研究", link: "/topic-research/" },
      { text: "標籤", link: "/tags" },
      { text: "歸檔", link: "/archive" },
      { text: "關於", link: "/about" },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/Clementtang/multivac42" },
    ],

    outline: {
      label: "本頁目錄",
    },

    // S-01, S-02: 搜尋功能增強
    search: {
      provider: "local",
      options: {
        // 預設顯示詳細搜尋結果（含上下文預覽）
        detailedView: true,
        // 中文化搜尋介面
        translations: {
          button: {
            buttonText: "搜尋",
            buttonAriaLabel: "搜尋文章",
          },
          modal: {
            displayDetails: "顯示詳細內容",
            resetButtonTitle: "清除搜尋",
            backButtonTitle: "關閉搜尋",
            noResultsText: "找不到相關結果",
            footer: {
              selectText: "選擇",
              navigateText: "切換",
              closeText: "關閉",
            },
          },
        },
        // MiniSearch 設定優化中文搜尋
        miniSearch: {
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            boost: { title: 4, text: 2, titles: 1 },
          },
        },
      },
    },

    footer: {
      message: "以 VitePress 建置",
      copyright: "© 2025 Clement Tang",
    },
  },
});

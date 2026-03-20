# Multivac 42

研究與寫作平台 - 探索商業、科技與產業的深度分析

## 開發環境設定

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run docs:dev

# 建置生產版本
npm run docs:build

# 預覽生產版本
npm run docs:preview
```

## 專案結構

```
multivac42/
├── docs/                    # 文章內容
│   ├── articles/            # 一般文章
│   ├── topic-research/      # 主題研究
│   └── company-research/    # 公司研究
├── .vitepress/
│   ├── config.ts            # VitePress 配置（含 Structured Data、SEO）
│   ├── rss.ts               # RSS feed 生成
│   ├── llms-generator.ts    # llms.txt / llms-full.txt / article .md 生成
│   └── theme/
│       ├── components/      # Vue 元件
│       ├── posts.data.ts    # 文章資料載入器
│       ├── tags.data.ts     # 標籤資料載入器
│       └── style.css        # 全域樣式
├── scripts/
│   └── validate-filenames.js # 文件命名驗證
└── M42-OPTIMIZATION-BACKLOG.md # 優化工作清單
```

## 文章命名規範

所有文章必須遵循 `YYYY-MM-DD-slug.md` 格式：

- 日期使用 ISO 格式（如 `2026-01-15`）
- Slug 只能包含小寫英文、數字、連字號
- 範例：`2026-01-15-my-article-title.md`

驗證文件命名：

```bash
node scripts/validate-filenames.js
```

## Frontmatter 欄位

```yaml
---
title: 文章標題
description: 文章描述（用於 SEO 和預覽）
date: 2026-01-15
tags:
  - 標籤1
  - 標籤2
author: Clement Tang
cover: /images/cover.jpg # 選填
featured: true # 選填，精選文章
series: series-slug # 選填，系列文章 ID
seriesTitle: 系列名稱 # 選填
seriesIndex: 1 # 選填，系列順序
---
```

## Build 產出

除了標準 HTML 之外，`buildEnd` hook 會自動生成：

- `feed.xml` — RSS 2.0 feed（最新 20 篇）
- `llms.txt` — AI 可讀的文章摘要索引（[llmstxt.org](https://llmstxt.org) 標準）
- `llms-full.txt` — 所有文章的完整 Markdown 內容
- `{article-url}.md` — 每篇文章的獨立 Markdown 檔案

## 效能優化

- **字型自託管**：Noto Sans TC + JetBrains Mono 透過 `@fontsource` 本地載入，消除 Google Fonts 外部請求
- **Twitter widgets.js 按需載入**：僅在使用 `<XEmbed>` 的頁面載入
- **GA4 閱讀深度追蹤**：在 25%/50%/75%/100% 捲動時觸發 `scroll_depth` 事件

## Structured Data

- **Article Schema**：含 Person author、encoding（指向 .md）
- **BreadcrumbList Schema**：所有頁面
- **WebSite Schema**：首頁（含 SearchAction）
- **Markdown alternate link**：文章頁 `<link rel="alternate" type="text/markdown">`

## 部署

網站透過 Vercel 自動部署：

- **Production**: [multivac42.com](https://multivac42.com)
- 推送到 `main` 分支會自動觸發部署
- www.multivac42.com 已設定 301 redirect 至 multivac42.com

## 授權

All rights reserved.

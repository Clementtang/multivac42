# Multivac 42 — AI 協作指引

## 專案概覽

繁體中文深度研究平台，VitePress + Vue 3，部署於 Vercel。
內容源頭在 Pensieve (`~/pensieve`)，透過 `publish-to-multivac.js` 發布至此。

## Build

```bash
npx vitepress build    # 不要用 npx vitepress build docs（會繞過 .vitepress/config.ts）
npm run docs:dev       # 開發伺服器
npm run lint           # markdownlint（CI blocking）
```

## 關鍵架構

- `srcDir: "docs"` 設定在 config.ts，build 時不需傳 docs 參數
- `buildEnd` hook 依序執行：RSS → llms.txt/llms-full.txt/article .md
- 站點常數集中在 `.vitepress/site.config.ts`（siteUrl, siteName, siteDescription, llmsDescription）

## Frontmatter Schema

```yaml
title: "文章標題" # 必填
description: "描述" # 必填，用於 SEO 和預覽
date: 2026-01-15 # 必填，ISO 日期
tags: ["標籤"] # 選填
author: "Clement Tang" # 選填，預設 Clement Tang
cover: /og/filename.png # 選填，OG image
featured: true # 選填，精選文章
draft: true # 選填，草稿（不出現在列表、RSS、llms.txt、tags）
series: series-slug # 選填，系列 ID
seriesTitle: "系列名稱" # 選填
seriesIndex: 1 # 選填，系列順序
```

不要使用 `publish` 或 `status` 欄位 — 這些不被任何 loader 讀取。

## Glob Patterns

所有 content loader 使用統一的 glob：

```
articles/*.md
topic-research/*.md
company-research/**/*.md
```

不要使用 `research/*.md`（此目錄不存在）。
修改 glob 時需同步更新：`posts.data.ts`、`tags.data.ts`、`rss.ts`、`llms-generator.ts`。

## 編輯流程

1. 在 Pensieve 編輯源檔
2. `cd ~/pensieve && node scripts/publish-to-multivac.js`
3. `cd ~/multivac42 && npx vitepress build` 驗證
4. 分別 commit 兩個 repo

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
- `buildEnd` hook 依序執行：RSS → llms.txt/llms-full.txt/article .md → `verify-output.ts` 逐篇核對產物（缺任一項就讓建置失敗）
- 缺必填欄位、`tags` 不是陣列、正文為空，都會讓建置失敗並指出檔案。Vercel 部署會卡住，Pensieve CI 仍是綠燈，發布後要看 Vercel 部署狀態
- 站點常數集中在 `.vitepress/site.config.ts`（siteUrl, siteName, siteDescription, llmsDescription）

## Frontmatter Schema

```yaml
title: "文章標題" # 必填
description: "描述" # 必填，用於 SEO 和預覽
date: 2026-01-15 # 必填，ISO 日期
lastModified: 2026-02-01 # 選填，與 date 不同時顯示「最後更新於」
tags: ["標籤"] # 選填，必須是陣列
author: "Clement Tang" # 選填，預設 Clement Tang
cover: /og/filename.png # 選填，OG image
featured: true # 選填，精選文章
draft: true # 選填，草稿（不出現在列表、RSS、llms.txt、tags；頁面仍會產生、可直連，也會進 sitemap 與站內搜尋）
series: series-slug # 選填，系列 ID
seriesTitle: "系列名稱" # 選填
seriesIndex: 1 # 選填，系列順序
```

不要使用 `publish` 或 `status` 欄位 — 這些不被任何 loader 讀取。

## Glob Patterns

四個 content loader（`posts.data.ts`、`tags.data.ts`、`rss.ts`、`llms-generator.ts`）共用 `.vitepress/content.ts` 的 `CONTENT_GLOBS` 與 `isPublishedPost`：

```
articles/*.md
topic-research/*.md
company-research/**/*.md
```

不要使用 `research/*.md`（此目錄不存在）。
新增內容目錄時需同步更新：`content.ts`、`verify-output.ts` 的 `CONTENT_DIRS`、`theme/config/categories.ts`、`scripts/validate-filenames.js`。`verify-output.ts` 刻意獨立掃 `docs`，不要改成重用 loader。

## 編輯流程（2026-07 起為 CI 自動發布）

1. 在 Pensieve 編輯源檔（M42 端**不要**手動 commit `docs/` 內容，會與 CI 衝突）
2. 發布前本地驗證：`cd ~/pensieve && node scripts/publish-to-multivac.js --validate --dry-run`
3. Pensieve `git push` → CI 自動轉換、auto-commit 並 push 到 M42 origin → Vercel 自動部署
4. M42 端開工先 `git pull --ff-only` 對齊；只 commit config / theme / infra
5. **發布後實地驗證線上**：目標頁 200＋關鍵元件出現＋圖片載入——CI success ≠ 文章上線（srcExclude / draft 會靜默排除，實踩過 404 一週才發現）

細節與陷阱：pensieve project memory `reference_publish_pipeline.md`。

# 專案稽核報告

> 稽核日期：2026-03-22
> 專案：Multivac42 (multivac42.com)
> 技術棧：VitePress + Vue 3 + Vercel

## 摘要

- P0: 1 項 / P1: 6 項 / P2: 8 項 / P3: 4 項

---

## 發現

### [P0] npm audit 存在 9 個安全漏洞（7 moderate, 2 high）

- **位置：** `node_modules/rollup` 及相關依賴
- **問題：** `npm audit` 回報 9 個漏洞，其中 2 個為 high severity。雖然 rollup 是 build-time 依賴不直接影響 production runtime，但 supply chain attack 的風險仍然存在（build 時執行惡意程式碼）。
- **影響：** build 環境可能暴露於已知漏洞，CI/CD pipeline 也受影響
- **建議：** 執行 `npm audit fix`；若需 breaking change 則評估 `npm audit fix --force` 的影響，或鎖定修復版本

---

### [P1] 內容載入器 glob pattern 不一致 — `research/*.md` 幽靈路徑

- **位置：** `rss.ts:36`, `tags.data.ts:17`, `llms-generator.ts:34`
- **問題：** 三個檔案使用 `"research/*.md"` glob pattern，但 `docs/research/` 目錄並不存在（實際路徑為 `docs/topic-research/`）。`posts.data.ts` 則正確使用 `"topic-research/*.md"`。這導致 RSS feed 和 tags 可能遺漏 topic-research 類別的文章，而 llms-generator 則同時載入了兩者但靠的是雙重 pattern。
- **影響：** RSS feed 和 tags 頁面可能缺少 topic-research 文章（目前 2 篇）
- **建議：** 統一所有 loader 使用 `"topic-research/*.md"`，移除不存在的 `"research/*.md"` pattern。考慮將 glob patterns 集中管理（如同 `categories.ts` 的思路）

### [P1] 重複文章 — 同一篇出現在 articles/ 和 topic-research/

- **位置：** `docs/articles/2025-12-12-retail-electronic-shelf-labels-analysis.md` 與 `docs/topic-research/2025-12-12-retail-electronic-shelf-labels-analysis.md`
- **問題：** 同標題文章存在於兩個目錄，內容有微小差異（frontmatter 用 `publish: true` vs `status: published`，部分段落內容不同）。兩份都會被 content loader 載入，產生重複的文章卡片、RSS 條目、sitemap entry。
- **影響：** SEO duplicate content penalty；讀者看到同一篇文章出現兩次；llms.txt 也重複索引
- **建議：** 決定哪個版本為正式版（建議保留 topic-research/ 版本，因 lastModified 較新），刪除另一個，必要時加 redirect

### [P1] `ignoreDeadLinks: true` 全域關閉連結檢查

- **位置：** `.vitepress/config.ts:17`
- **問題：** 此設定完全停用 VitePress 的死連結偵測。隨著文章數量增長到 43+ 篇，內部交叉連結的維護越來越重要，卻沒有任何工具幫忙發現斷鏈。
- **影響：** 壞掉的內部連結無法在 build 時被發現，只能靠人工或搜尋引擎報告
- **建議：** 改為 `ignoreDeadLinks: 'localhostLinks'` 或列出已知外部死連結的 allowlist，而非全域關閉

### [P1] siteUrl / siteName / siteDescription 重複定義 4 次，且描述不一致

- **位置：** `config.ts:5`, `rss.ts:5-7`, `llms-generator.ts:5-8`, `TextSelectionShare.vue:11`
- **問題：** `siteUrl` 在 4 個檔案各自 hardcode。`siteDescription` 在 config.ts 是「研究與寫作 - 探索商業、科技與產業的深度分析」，在 rss.ts 也是這段，但在 llms-generator.ts 卻是「繁體中文深度研究平台，涵蓋企業研究、產業分析、商業與科技趨勢。」— 語意不同。
- **影響：** 修改網站描述時需要同步 4 處，且目前已經不一致了。AI agent 讀取 llms.txt 看到的描述與人類在 RSS reader 看到的不同
- **建議：** 建立 `site.config.ts` 或在 config.ts 中 export 共用常數，其他檔案統一引用

### [P1] CI 中 markdownlint 用 `|| true` 靜默忽略所有錯誤

- **位置：** `.github/workflows/validate.yml:22`
- **問題：** `npx markdownlint-cli2 ... || true` 等同於「跑 linter 但不管結果」。CI 不會因 lint 失敗而阻擋合併。
- **影響：** markdownlint 的檢查形同虛設，lint 錯誤不會被 CI 攔截
- **建議：** 移除 `|| true`，或至少降級為 `continue-on-error: true`（仍顯示警告），讓 lint 結果被看見

### [P1] frontmatter 欄位命名不一致（publish/status/featured）

- **位置：** 多篇文章的 frontmatter
- **問題：** `articles/2025-12-12-retail-electronic-shelf-labels-analysis.md` 使用 `publish: true`，`topic-research/` 版本使用 `status: published`，而 README 定義的標準欄位是 `featured: true`。`posts.data.ts` 只認 `featured`，不認 `publish` 或 `status`，等於這些欄位寫了也沒用。
- **影響：** 作者意圖（控制發布狀態）無法生效；未來新增草稿功能會更混亂
- **建議：** 決定正式的發布控制欄位（如 `draft: true`），在 posts.data.ts 中實作過濾，並更新 README frontmatter 文檔

---

### [P2] build 產出 `.vitepress/dist/` 殘留在本地

- **位置：** `.vitepress/dist/`（含 HTML、XML、JSON 等 build artifacts）
- **問題：** 雖然 `.gitignore` 已排除此目錄（且最近 commit `d8145a8` 剛清理過一次誤 commit），但目錄仍在本地存在。歷史上曾被 commit 進 repo。
- **影響：** 已修正，但顯示缺少 pre-commit hook 來防止再次發生
- **建議：** 加入 pre-commit hook（husky/lint-staged）檢查是否有 dist/ 被 staged

### [P2] `reports/` 目錄包含 `.DS_Store` 和 GSC 報告，用途不明

- **位置：** `reports/GSC/`
- **問題：** 目錄內有 Google Search Console 匯出的 coverage 和 performance 報告（2026-01-23），但沒有 README 說明用途，且 `.DS_Store` 也被保留在目錄中（雖未進 git）。
- **影響：** 不清楚這些報告是否需要版控；隨時間累積會變成無人維護的歷史資料
- **建議：** 若需版控，加 README 說明更新頻率與用途；若不需要，加入 `.gitignore` 或移除

### [P2] `research/` 根目錄的 `og-image-generation.md` 放置位置不當

- **位置：** `research/og-image-generation.md`（專案根目錄的 research/）
- **問題：** 這是一份技術研究文件，但放在根目錄的 `research/` 而非 `docs/` 之下。它不會被 VitePress 處理，也不屬於 `docs/topic-research/`。且根目錄的 `research/` 與 `docs/topic-research/` 容易混淆。
- **影響：** 文件散落在非慣例位置，增加尋找困難度
- **建議：** 移至 `docs/` 或建立明確的 `docs/internal/` 目錄存放內部技術研究

### [P2] Copyright 年份為 2025，已過期

- **位置：** `.vitepress/config.ts:347`
- **問題：** Footer 顯示 `© 2025 Clement Tang`，但現在是 2026 年。
- **影響：** 網站看起來未被維護
- **建議：** 改為 `© 2025-${new Date().getFullYear()} Clement Tang` 動態生成，或至少更新為 2026

### [P2] markdownlint-cli2 版本落後很多（0.17 vs 0.22）

- **位置：** `package.json:14`
- **問題：** `markdownlint-cli2` 目前 0.17.2，latest 為 0.22.0。跨了 5 個 minor 版本，可能包含新 rule、bug fix、效能改善。
- **影響：** 可能無法使用新的 lint 規則，與社群標準脫節
- **建議：** 升級至 latest（`npm install markdownlint-cli2@latest -D`）

### [P2] M42-OPTIMIZATION-BACKLOG.md 最後更新標記為 2026-02-03，但六章節編號有重複

- **位置：** `M42-OPTIMIZATION-BACKLOG.md`
- **問題：** 文件有「## 六、AI 可讀性」（line 172）和「## 六、基礎建設」（line 239），同為第六章。完成進度宣稱 56/59 (95%) 但已超過一個月未更新。
- **影響：** 章節編號混亂影響可讀性；進度資訊可能已過時
- **建議：** 修正編號（基礎建設應為七或合併），更新日期

### [P2] `config.ts` 中 `companyNameMap` 是硬編碼的公司名稱映射

- **位置：** `.vitepress/config.ts:147-153`
- **問題：** breadcrumb 的公司名稱映射（luckin-coffee → 瑞幸咖啡 等）是手動維護的靜態 map。新增公司研究時需要記得更新這裡。目前有 6 家公司研究（base, toast, hotai, urbox, luckin-coffee, airwallex, manus-ai, anta），但 map 只有 5 家（缺少 base, urbox, anta）。
- **影響：** 缺少映射的公司在 breadcrumb Schema 中顯示 slug 而非中文名稱（如 `base` 而非 `BASE`、`anta` 而非 `安踏`）
- **建議：** 從 company-research 子目錄的 frontmatter 中動態讀取名稱，或至少補齊缺少的映射

---

### [P3] `.claude/` 目錄為空

- **位置：** `.claude/`
- **問題：** 目錄存在但無任何內容（無 CLAUDE.md、無設定檔）。
- **影響：** 不影響功能，但空目錄佔位且可能造成困惑
- **建議：** 加入 CLAUDE.md 記錄專案特定的 AI 協作指引，或刪除空目錄

### [P3] validate-filenames.js 使用 ESM import 但副檔名是 .js

- **位置：** `scripts/validate-filenames.js`
- **問題：** 腳本用 `import { readdirSync } from "fs"` ESM 語法。這能運作是因為 package.json 設了 `"type": "module"`，但 `.js` 副檔名在 ESM context 下不直覺，且 IDE 可能不提供正確的 type checking。
- **影響：** 功能正常，但不符合 TypeScript-first 的專案風格（其他檔案都是 `.ts`）
- **建議：** 重命名為 `.mjs` 或轉為 `.ts`（配合 `tsx` 或 VitePress 的 Node 環境執行）

### [P3] `docs/.vitepress/` 出現在 .gitignore 但此路徑不存在

- **位置：** `.gitignore:4`
- **問題：** gitignore 中有 `docs/.vitepress/` 條目，但 VitePress 的 `.vitepress/` 在專案根目錄而非 docs/ 下。這是一條無效的 gitignore 規則。
- **影響：** 不影響功能，但增加混淆
- **建議：** 移除無效條目

### [P3] README 的專案結構圖列出 `components/` 目錄但未展開

- **位置：** `README.md:34`
- **問題：** README 結構圖顯示 `├── components/      # Vue 元件`，但實際有 21 個 Vue 元件，是專案最複雜的部分。結構圖也未提及 `config/categories.ts`。
- **影響：** 新貢獻者難以快速理解元件架構
- **建議：** 至少列出主要元件分類（Layout 相關、Article 相關、Navigation 相關）

---

## 未發現重大問題的維度

- **安全性**：無 hardcoded secrets、API key 正確使用環境變數模式（GA4 measurement ID 為公開資訊）
- **部署設定**：vercel.json 設定合理，www redirect 正確
- **Vue 元件品質**：Layout.vue 使用 computed 和 slot 架構清晰，元件分工明確

---

## 回應（2026-03-22）

### [P0] npm audit 9 個安全漏洞

**認同，立即處理。** 已驗證 9 個漏洞（7 moderate, 2 high）均來自 rollup 4.x。雖為 build-time 依賴，但 supply chain attack 風險合理。將執行 `npm audit fix` 並驗證 build 不受影響。

### [P1] `research/*.md` 幽靈路徑

**認同，有效 bug。** 已驗證 `docs/research/` 不存在。`rss.ts`、`tags.data.ts`、`llms-generator.ts` 三處使用 `research/*.md`，但 `posts.data.ts` 正確使用 `topic-research/*.md`。結果是 RSS 和 tags 確實未載入 topic-research 文章（目前 2 篇）。將統一為 `topic-research/*.md`，並評估是否集中管理 glob patterns。

### [P1] 重複文章 — 電子標籤分析

**認同，有效 bug。** 已驗證兩份檔案存在於 `articles/` 和 `topic-research/`，frontmatter 和部分內容有差異（`publish: true` vs `status: published`；日本市場分析段落 topic-research 版本更完整）。將保留 `topic-research/` 版本（較新且更正確），刪除 `articles/` 版本。

### [P1] `ignoreDeadLinks: true` 全域關閉

**認同。** 這是先前修復 2 個 company-research 路徑錯誤時為了讓 build 通過而設的。既然死連結已修復，應改為更精確的設定。將改為 allowlist 模式，僅忽略已知的外部失效連結。

### [P1] siteUrl/siteName/siteDescription 重複定義

**認同，且已不一致。** 已驗證 4 處 hardcode，`llms-generator.ts` 的 description 與其他三處不同。這是 llms-generator 開發時獨立撰寫了更適合 AI 讀者的描述。將建立 `site.config.ts` 集中管理，llms.txt 描述可保留為獨立欄位（用途不同於 RSS/HTML meta）。

### [P1] CI markdownlint `|| true`

**認同。** 這確實讓 lint 形同虛設。將移除 `|| true`，改為 `continue-on-error: true`，至少讓 CI 結果可見。長期應修正所有 lint 錯誤後完全啟用 blocking。

### [P1] frontmatter 欄位命名不一致

**認同，與重複文章問題相關。** `publish` 和 `status` 都不被 `posts.data.ts` 讀取，寫了等於沒寫。刪除重複文章後，問題範圍會縮小。將在 README 明確定義：使用 `draft: true` 控制發布，`posts.data.ts` 加入過濾邏輯。

### [P2] build 產出殘留

**已修正（commit d8145a8）。** 稽核建議加 pre-commit hook 防止再次發生，合理。但考慮到此專案目前只有一人維護，`.gitignore` 已覆蓋，暫不加 husky — 增加 devDependencies 複雜度不成比例。

### [P2] `reports/` 目錄

**認同。** GSC 報告是手動匯出的歷史快照，不需要版控。將加入 `.gitignore`。

### [P2] `research/og-image-generation.md` 放置位置

**認同。** 這是內部技術研究文件，不應與 `docs/topic-research/`（面向讀者的內容）混淆。將移至根目錄的 `docs/internal/` 或直接保留在 `research/`（加到 `.gitignore` 不進版控）。考量到此檔案是工作筆記性質，傾向不進版控。

### [P2] Copyright 年份 2025

**認同，trivial fix。** 將改為動態生成 `© 2025-${new Date().getFullYear()}`。

### [P2] markdownlint-cli2 版本落後

**認同。** 0.17 → 0.22 跨 5 個 minor 版本。將升級並確認無 breaking change。

### [P2] Backlog 章節編號重複

**認同，我的疏失。** 新增「六、AI 可讀性」時未注意已有「六、基礎建設」。將修正為七。

### [P2] companyNameMap 不完整

**認同，有效 bug。** 目前 8 家公司研究但 map 只有 5 家。Base、UrBox、安踏的 breadcrumb 顯示 slug 而非名稱。將補齊映射。動態從 frontmatter 讀取是好方向，但 transformPageData 階段取得其他頁面 frontmatter 有技術限制，暫先手動補齊。

### [P3] `.claude/` 目錄為空

**認同。** 將加入 CLAUDE.md 記錄專案特定指引（build 指令、glob pattern 規範、frontmatter schema）。

### [P3] validate-filenames.js 副檔名

**不急。** 功能正常，`"type": "module"` 下 `.js` 使用 ESM 是 Node.js 官方支援的行為。改 `.mjs` 或 `.ts` 是美觀問題，排入低優先。

### [P3] `.gitignore` 中 `docs/.vitepress/` 無效

**部分認同。** 此條目是為了防止 `npx vitepress build docs` 產生 `docs/.vitepress/dist/` 時被 commit（已發生過一次）。雖然目前正確的 build 指令不會產生此路徑，但作為防禦性規則可保留。

### [P3] README 專案結構圖未展開 components

**認同。** 21 個 Vue 元件確實是專案最複雜的部分。將補充主要元件分類。

---

## 修正計畫

### 立即修正（本次 session）

| 項目                                                      | 對應發現 |
| --------------------------------------------------------- | -------- |
| `npm audit fix`                                           | P0       |
| 統一 glob pattern `research/*.md` → `topic-research/*.md` | P1       |
| 刪除重複的電子標籤文章（articles/ 版本）                  | P1       |
| 補齊 companyNameMap（base, urbox, anta）                  | P2       |
| Copyright 2025 → 動態年份                                 | P2       |
| Backlog 章節編號修正                                      | P2       |

### 近期修正

| 項目                                       | 對應發現 |
| ------------------------------------------ | -------- |
| ignoreDeadLinks 改為 allowlist             | P1       |
| 建立 site.config.ts 集中管理常數           | P1       |
| CI 移除 `\|\| true` 改用 continue-on-error | P1       |
| 定義 draft: true frontmatter 標準          | P1       |
| 升級 markdownlint-cli2                     | P2       |
| 加入 CLAUDE.md                             | P3       |

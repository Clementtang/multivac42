# M42 OG Image 生成方案研究

> 日期：2026-03-20
> 狀態：研究階段，尚未決定方案

## 需求

- 43 篇文章全部缺少 OG image（frontmatter 無 cover 欄位）
- 社群分享時無預覽圖
- 圖片上**不需要文字/標題**，純視覺背景代表文章主題
- 需統一畫風，有品牌辨識度（Amber/Gold #f59e0b + 深色 #0a0a0f）
- 排除 programmatic 方案（satori、@vercel/og）— 品質不夠好
- 需可批次處理，未來新文章也能延續
- 規格：1200x630px（OG image 標準）

---

## 方案評估

### 1. Nano Banana Pro（Google Gemini 3 Pro Image）

**概述：** Google 最新的專業級圖片生成模型，基於 Gemini 3 Pro。支援 4K 解析度、風格參考圖、多輪對話式編輯。

**優勢：**

- 使用者已有付費訂閱，**網頁介面無限生圖**（零邊際成本）
- 支援最多 14 張參考圖混合，可維持品牌風格一致性
- 支援 16:9 比例（最接近 1200x630），1K/2K/4K 三種解析度
- 可透過 Vertex AI API 或 Gemini API 程式化呼叫
- 多輪對話：可逐步調整圖片直到滿意

**API 定價（額外計費）：**
| 解析度 | 標準 | Batch（-50%） |
|--------|------|---------------|
| 1K-2K | $0.134/張 | $0.067/張 |
| 4K | $0.24/張 | $0.12/張 |

**限制：**

- 不支援任意像素尺寸，僅 10 種固定比例（16:9 最接近 OG 需求）
- 生成後需用 sharp 裁切到精確的 1200x630
- 風格一致性靠 reference images + prompt template 控制，無 LoRA 級別的鎖定

**批次流程（網頁介面手動）：**

1. 在 Google AI Studio 建立風格參考 + prompt template
2. 逐篇生成，手動挑選滿意的版本
3. 下載後用 script 批次裁切到 1200x630
4. 放入 docs/public/og/，更新 frontmatter

**批次流程（API 自動）：**

1. Node.js script 讀取 frontmatter → 生成 prompt
2. 呼叫 Gemini API（附 reference images）
3. 下載 → sharp 裁切 → 存入 public/og/
4. 43 篇 API 成本：~$2.88（2K batch）

**適合度：高。** 已有訂閱，網頁介面可先手動試風格方向，確定後再決定是否用 API 批次。

---

### 2. Flux + LoRA（Replicate）

**概述：** Black Forest Labs 的開源圖片生成模型，可訓練自訂 LoRA 鎖定風格。透過 Replicate 平台全代管。

**優勢：**

- LoRA 風格鎖定是所有方案中**一致性最高的**（用 20-30 張範例訓練）
- 成本極低：$0.015-0.055/張
- API 驅動，完全可自動化
- 開源生態豐富（ComfyUI、Cloudflare Workers AI）

**定價：**
| Tier | 單價 |
|------|------|
| Schnell | $0.015/張 |
| Dev | $0.025/張 |
| Pro v1.1 | $0.055/張 |
| LoRA 訓練 | ~$5-10（一次性） |

**限制：**

- 需先準備 20-30 張風格範例訓練 LoRA
- Replicate 帳號設定 + API key 管理
- 無多輪對話式微調（生成即定）

**批次流程：**

1. 設計風格方向 → 用 Midjourney 或 Nano Banana Pro 生成 20-30 張參考
2. 上傳到 Replicate 訓練 Flux LoRA（~20 分鐘）
3. Node.js script：frontmatter → prompt → Replicate API → 下載
4. 43 篇成本：$0.65-2.37 + LoRA 訓練 $5-10

**適合度：高。** 風格一致性最強，成本最低，但前置作業（LoRA 訓練）需要時間。

---

### 3. Gemini Imagen 4（Vertex AI）

**概述：** Google 的獨立文字到圖片模型，專注於快速生成。無多輪對話能力。

**優勢：**

- 三個 tier 靈活選擇速度/品質
- Batch API 享 50% 折扣
- 與 GCP 生態整合

**定價：**
| Tier | 標準 | Batch（-50%） |
|------|------|---------------|
| Fast | $0.02/張 | $0.01/張 |
| Standard | $0.04/張 | $0.02/張 |
| Ultra | $0.06/張 | $0.03/張 |

**限制：**

- 無 reference image 功能（風格靠 prompt 控制，一致性不如 Nano Banana Pro 和 Flux LoRA）
- 純文字到圖片，不支援多輪編輯
- 無 batch discount 以外的批量功能

**批次流程：**

1. Node.js script：frontmatter → prompt → Vertex AI Batch API
2. 43 篇成本：$0.43-1.29（Batch pricing）

**適合度：中。** 最便宜但風格控制最弱。適合「快速產出一批再人工挑選」的流程。

---

### 4. Midjourney + --sref

**概述：** 風格參考（Style Reference）功能是業界最強的風格鎖定方案。

**優勢：**

- `--sref` + `--sw`（style weight 0-1000）風格鎖定非常精確
- 圖片品質頂級
- 社群生態豐富，風格參考資源多

**限制：**

- **無正式 API**（截至 2026 年初），必須透過 Discord 操作
- 批次自動化困難（需第三方 bot）
- 訂閱制 $10-60/月
- 不適合程式化整合到 build pipeline

**適合度：低。** 品質最好但無法自動化，43 篇手動操作不切實際。

---

### 5. Playwright + HTML Template 截圖

**概述：** 設計 HTML/CSS 模板，Playwright 批次截圖。

**優勢：**

- 風格 100% 一致（模板驅動）
- 完全免費（本地運算）
- 可整合到 VitePress buildEnd hook
- David Bushell 實測每張約 1 秒

**限制：**

- 視覺豐富度有限（CSS/SVG 為主）
- 不需要文字的話，HTML 模板主要只能做幾何圖形/漸層
- 要做出有辨識度的畫風，設計門檻較高

**開源工具：**

- [node-html-to-image](https://github.com/frinyvonnick/node-html-to-image) — 最簡單的 HTML → PNG
- [puppeteer-social-image](https://github.com/chrisvxd/puppeteer-social-image) — Handlebars 模板
- [og-image-creator](https://github.com/dejurin/og-image-creator) — CLI 工具

**適合度：低（獨立使用）/ 中（混合方案的一部分）。** 適合搭配 AI 生成的背景圖使用。

---

### 6. SaaS 平台（Bannerbear / Placid）

**概述：** 拖拉式模板設計 + REST API 動態替換。

**優勢：**

- 零技術門檻
- REST/URL API 可程式化

**限制：**

- 月費制
- 不含 AI 背景生成
- 對 M42 這種規模過度設計

**適合度：低。** 不符合需求。

---

## 綜合比較

| 方案                        | 風格一致性   | 批次能力 | 成本（43篇）   | 自動化 | 前置作業        |
| --------------------------- | ------------ | -------- | -------------- | ------ | --------------- |
| **Nano Banana Pro（網頁）** | 高           | 手動     | 免費（已訂閱） | 低     | 低              |
| **Nano Banana Pro（API）**  | 高           | 高       | ~$2.88         | 高     | 中              |
| **Flux + LoRA**             | 非常高       | 高       | ~$6-12         | 高     | 高（LoRA 訓練） |
| **Imagen 4 Batch**          | 中           | 高       | ~$0.43-1.29    | 高     | 低              |
| **Midjourney**              | 非常高       | 低       | $10-60/月      | 低     | 低              |
| **Playwright**              | 100%（模板） | 非常高   | 免費           | 非常高 | 高（設計）      |

---

## 推薦路線

### 短期（先處理 43 篇）：Nano Banana Pro 網頁介面

1. 在 AI Studio 設計 2-3 個視覺方向，用 reference images 鎖定風格
2. 手動逐篇生成，可即時調整不滿意的結果
3. 零額外成本（已付費訂閱）
4. 產出的圖同時作為未來 LoRA 訓練的素材

### 中期（自動化）：二擇一

**A. Nano Banana Pro API** — 如果對 Google 生態已熟悉，reference images 的風格控制夠用
**B. Flux + LoRA** — 如果需要更極致的風格一致性，用短期產出的圖訓練 LoRA

### Prompt Template 範例

```
Abstract digital visualization representing {topic},
dark background, amber gold light accents,
minimalist composition, tech research aesthetic,
16:9 widescreen, no text, no watermark, cinematic lighting
```

`{topic}` 範例映射：

- 瑞幸咖啡 → `coffee industry disruption, phoenix rebirth from crisis`
- Airwallex → `global cross-border payment flows, interconnected networks`
- 越南經濟 → `southeast asian economic landscape, structural challenges`
- Manus AI → `AI agent automation, rapid startup growth acquisition`

---

## 技術整合（實作時參考）

產出後的檔案放置與 frontmatter 更新：

```
docs/public/og/
├── 2025-11-28-luckin-coffee-research.png
├── 2025-12-10-airwallex-fintech-analysis.png
└── ...
```

Frontmatter 加入：

```yaml
cover: /og/2025-11-28-luckin-coffee-research.png
```

config.ts 已有 og:image 邏輯（讀取 cover 欄位），無需修改。

---

## 參考資料

- [Nano Banana Pro 官方介紹](https://blog.google/innovation-and-ai/products/nano-banana-pro/)
- [Nano Banana Pro API 完整指南](https://www.atlascloud.ai/blog/guides/how-to-use-nano-banana-pro-api-the-complete-guide-in-2026)
- [Nano Banana Pro 定價與 Batch API](https://blog.laozhang.ai/en/posts/nano-banana-pro-batch-api-cost-optimization)
- [Nano Banana 比例設定指南](https://www.aifreeapi.com/en/posts/nano-banana-pro-aspect-ratio-guide)
- [Gemini Image Generation API 文件](https://ai.google.dev/gemini-api/docs/image-generation)
- [Imagen 4 Vertex AI 文件](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/imagen/4-0-generate)
- [Vertex AI 定價](https://cloud.google.com/vertex-ai/generative-ai/pricing)
- [Replicate Flux LoRA 指南](https://replicate.com/docs/guides/extend/working-with-loras)
- [Replicate Flux Fine-tunes](https://replicate.com/collections/flux-fine-tunes)
- [David Bushell: OG Images with Playwright](https://dbushell.com/2024/11/15/generate-open-graph-images-with-playwright/)
- [Bannerbear: Custom OG Image with Puppeteer](https://www.bannerbear.com/blog/how-to-make-a-custom-open-graph-image-using-puppeteer/)
- [Midjourney Style Reference 文件](https://docs.midjourney.com/docs/style-reference)
- [ChatPRD: Consistent Brand Imagery in Midjourney](https://www.chatprd.ai/how-i-ai/consistent-brand-imagery-in-midjourney)
- [node-html-to-image (GitHub)](https://github.com/frinyvonnick/node-html-to-image)
- [Nano Banana Pro vs Midjourney v8 比較](https://blog.laozhang.ai/en/posts/nano-banana-pro-vs-midjourney-v8)
- [Nano Banana Pro 批次廣告素材生成](https://help.apiyi.com/en/nano-banana-pro-batch-template-advertising-guide-en.html)

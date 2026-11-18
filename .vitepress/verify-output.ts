import type { SiteConfig } from "vitepress";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import path from "path";
import matter from "gray-matter";

import { siteUrl } from "./site.config";

// 建置最後一步：從 docs 目錄獨立列出應發布的文章，逐篇確認產物齊全。
// 刻意不重用 content loader，否則 glob 寫錯時預期清單和產物會一起少算。
// 背景：曾有文章被靜默排除，線上 404 一週才發現。
const CONTENT_DIRS = ["articles", "topic-research", "company-research"];

function listMarkdownFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    throw new Error(`內容目錄不存在：${dir}`);
  }
  return readdirSync(dir).flatMap((name) => {
    const fullPath = path.join(dir, name);
    if (statSync(fullPath).isDirectory()) return listMarkdownFiles(fullPath);
    return name.endsWith(".md") ? [fullPath] : [];
  });
}

// 與 content loader 同一個解析器與真值判斷（VitePress 內部即用 gray-matter），
// 否則 draft: "true"、行尾註解、CRLF、BOM 等寫法兩邊判斷不一致，合法內容也會擋下部署。
function isDraft(filePath: string): boolean {
  return Boolean(matter(readFileSync(filePath, "utf-8")).data.draft);
}

function expectedArticlePaths(srcDir: string): string[] {
  return CONTENT_DIRS.flatMap((dir) =>
    listMarkdownFiles(path.join(srcDir, dir)),
  )
    .filter((file) => path.basename(file) !== "index.md")
    .filter((file) => !isDraft(file))
    .map((file) => path.relative(srcDir, file).replace(/\.md$/, ""));
}

export function verifyBuildOutput(config: SiteConfig): void {
  const outDir = config.outDir;
  const llmsTxt = readFileSync(path.join(outDir, "llms.txt"), "utf-8");
  const sitemap = readFileSync(path.join(outDir, "sitemap.xml"), "utf-8");

  const problems: string[] = [];
  const expected = expectedArticlePaths(config.srcDir);

  for (const articlePath of expected) {
    // sitemap 以 new URL() 正規化，非 ASCII 與空白會被 percent-encode；比對時用同一種寫法
    const url = new URL(articlePath, `${siteUrl}/`).href;
    const missing: string[] = [];
    if (!existsSync(path.join(outDir, `${articlePath}.html`)))
      missing.push("HTML");
    const mdFile = path.join(outDir, `${articlePath}.md`);
    if (!existsSync(mdFile) || statSync(mdFile).size === 0) missing.push(".md");
    const llmsUrl = `${siteUrl}/${articlePath}`;
    if (!llmsTxt.includes(`(${llmsUrl})`) && !llmsTxt.includes(`(${url})`))
      missing.push("llms.txt");
    if (!sitemap.includes(`<loc>${url}</loc>`)) missing.push("sitemap");
    if (missing.length > 0)
      problems.push(`${articlePath}：缺 ${missing.join("、")}`);
  }

  if (problems.length > 0) {
    throw new Error(
      `建置產物檢查失敗（${problems.length} 篇）：\n${problems.join("\n")}\n` +
        "常見原因：檔案放在 content.ts 的 CONTENT_GLOBS 沒涵蓋的子目錄（articles、topic-research 只收第一層），或 frontmatter 有誤。",
    );
  }
  console.log(`✓ Build output verified: ${expected.length} articles`);
}

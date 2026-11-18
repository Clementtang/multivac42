import { createContentLoader, type SiteConfig } from "vitepress";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

import { siteUrl, siteName, llmsDescription } from "./site.config";
import { CONTENT_GLOBS, isPublishedPost, toIsoDate } from "./content";

interface Article {
  title: string;
  url: string;
  date: string;
  description: string;
  category: string;
  rawContent: string;
}

function categorize(url: string): string {
  if (url.includes("/company-research/")) return "公司研究";
  if (url.includes("/topic-research/")) return "主題研究";
  return "文章";
}

export async function generateLlmsTxt(config: SiteConfig) {
  try {
    const articles: Article[] = [];

    const loader = createContentLoader(CONTENT_GLOBS, {
      excerpt: false,
      render: false,
      includeSrc: true,
    });

    const rawPosts = await loader.load();

    for (const post of rawPosts.filter(isPublishedPost)) {
      const fm = post.frontmatter;
      const rawContent = (post.src || "").replace(/^---[\s\S]*?---\n*/, "");

      // An empty body used to be skipped silently, leaving llms.txt pointing at
      // an .md that was never written. Fail the build instead.
      if (!rawContent.trim()) {
        throw new Error(`文章正文為空，無法產生 .md：${post.url}`);
      }

      articles.push({
        title: fm.title,
        url: post.url,
        date: toIsoDate(fm.date),
        description: fm.description || "",
        category: categorize(post.url),
        rawContent,
      });
    }

    articles.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // --- Generate llms.txt (summary) ---
    const grouped = new Map<string, Article[]>();
    for (const a of articles) {
      const list = grouped.get(a.category) || [];
      list.push(a);
      grouped.set(a.category, list);
    }

    const sectionOrder = ["公司研究", "主題研究", "文章"];
    let llmsTxt = `# ${siteName}\n\n> ${llmsDescription}\n\n`;

    for (const section of sectionOrder) {
      const items = grouped.get(section);
      if (!items || items.length === 0) continue;
      llmsTxt += `## ${section}\n\n`;
      for (const a of items) {
        const desc = a.description ? `: ${a.description}` : "";
        llmsTxt += `- [${a.title}](${siteUrl}${a.url})${desc}\n`;
      }
      llmsTxt += "\n";
    }

    llmsTxt += `## Optional\n\n`;
    llmsTxt += `- [完整內容版本](${siteUrl}/llms-full.txt): 所有文章的完整 Markdown 內容\n`;
    llmsTxt += `- [RSS Feed](${siteUrl}/feed.xml): 最新文章訂閱\n`;
    llmsTxt += `- [Sitemap](${siteUrl}/sitemap.xml): 全站頁面索引\n`;
    llmsTxt += `- [關於](${siteUrl}/about): 關於本站與作者\n`;

    // --- Generate llms-full.txt (full content) ---
    let llmsFullTxt = `# ${siteName}\n\n> ${llmsDescription}\n\n`;
    llmsFullTxt += `本文件包含所有已發布文章的完整內容，共 ${articles.length} 篇。\n\n---\n\n`;

    for (const a of articles) {
      llmsFullTxt += `## ${a.title}\n\n`;
      llmsFullTxt += `- URL: ${siteUrl}${a.url}\n`;
      llmsFullTxt += `- 日期: ${a.date}\n`;
      llmsFullTxt += `- 分類: ${a.category}\n\n`;
      llmsFullTxt += a.rawContent.trim() + "\n\n";
      llmsFullTxt += "---\n\n";
    }

    const outDir = config.outDir || ".vitepress/dist";
    writeFileSync(path.join(outDir, "llms.txt"), llmsTxt.trim());
    writeFileSync(path.join(outDir, "llms-full.txt"), llmsFullTxt.trim());

    // --- P1: Article-level .md files ---
    let mdCount = 0;
    for (const a of articles) {
      const mdPath = path.join(outDir, a.url.replace(/\/$/, "") + ".md");
      mkdirSync(path.dirname(mdPath), { recursive: true });
      writeFileSync(mdPath, a.rawContent.trim());
      mdCount++;
    }

    console.log(`✓ llms.txt generated: ${articles.length} articles indexed`);
    console.log(`✓ llms-full.txt generated`);
    console.log(`✓ ${mdCount} article .md files generated`);
  } catch (error) {
    console.error("✗ Failed to generate llms files:", error);
    throw error;
  }
}

import { createContentLoader, type SiteConfig } from "vitepress";
import { writeFileSync } from "fs";
import path from "path";

const siteUrl = "https://multivac42.com";
const siteName = "Multivac 42";
const siteDescription = "研究與寫作 - 探索商業、科技與產業的深度分析";

interface Post {
  title: string;
  url: string;
  date: string;
  description?: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toUTCString();
}

export async function generateRssFeed(config: SiteConfig) {
  const posts: Post[] = [];

  // Load articles
  const loader = createContentLoader(
    ["articles/*.md", "research/*.md", "company-research/**/*.md"],
    {
      excerpt: true,
      render: false,
    },
  );

  const rawPosts = await loader.load();

  for (const post of rawPosts) {
    if (post.url.endsWith("/")) continue; // Skip index pages

    const frontmatter = post.frontmatter || {};
    if (!frontmatter.title || !frontmatter.date) continue;

    posts.push({
      title: frontmatter.title,
      url: post.url,
      date: frontmatter.date,
      description: frontmatter.description || "",
    });
  }

  // Sort by date descending
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Generate RSS XML
  const rssItems = posts
    .slice(0, 20)
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}${post.url}</link>
      <guid>${siteUrl}${post.url}</guid>
      <pubDate>${formatDate(post.date)}</pubDate>
      <description>${escapeXml(post.description || "")}</description>
    </item>`,
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>zh-TW</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  const outDir = config.outDir || ".vitepress/dist";
  writeFileSync(path.join(outDir, "feed.xml"), rss.trim());
  console.log("RSS feed generated: feed.xml");
}

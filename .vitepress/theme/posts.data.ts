import { createContentLoader } from "vitepress";
import { CONTENT_GLOBS, isPublishedPost } from "../content";

// Frontmatter 欄位型別定義
interface Frontmatter {
  title?: string;
  description?: string;
  date?: string;
  lastModified?: string;
  tags?: string[];
  author?: string;
  cover?: string;
  featured?: boolean;
  draft?: boolean;
  series?: string;
  seriesTitle?: string;
  seriesIndex?: number;
}

export interface Post {
  title: string;
  description: string;
  date: string;
  lastModified?: string;
  url: string;
  tags: string[];
  author: string;
  cover?: string;
  readingTime: number;
  wordCount: number;
  featured?: boolean;
  series?: string;
  seriesTitle?: string;
  seriesIndex?: number;
}

declare const data: Post[];
export { data };

// 收錄範圍與驗證規則集中在 .vitepress/content.ts；新增類別時也要同步 config/categories.ts
export default createContentLoader(CONTENT_GLOBS, {
  excerpt: true,
  includeSrc: true, // Required for word count calculation
  transform(rawData) {
    return rawData
      .filter(isPublishedPost)
      .map((page) => {
        const frontmatter = page.frontmatter as Frontmatter;

        // Calculate reading time (中文 400 字/分鐘，英文 200 字/分鐘)
        const content = page.src || "";
        const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
        const totalWords = chineseChars + englishWords;
        const readingTime = Math.max(
          1,
          Math.ceil(chineseChars / 400 + englishWords / 200),
        );

        return {
          // 必填欄位已由 isPublishedPost 驗證
          title: frontmatter.title as string,
          description: frontmatter.description as string,
          date: frontmatter.date as string,
          lastModified: frontmatter.lastModified,
          url: page.url,
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
          author: frontmatter.author || "Clement Tang",
          cover: frontmatter.cover,
          readingTime,
          wordCount: totalWords,
          featured: frontmatter.featured || false,
          series: frontmatter.series,
          seriesTitle: frontmatter.seriesTitle,
          seriesIndex: frontmatter.seriesIndex,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
});

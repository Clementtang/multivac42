import { createContentLoader } from "vitepress";

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

export default createContentLoader(
  ["articles/*.md", "research/*.md", "company-research/**/*.md"],
  {
    excerpt: true,
    includeSrc: true, // Required for word count calculation
    transform(rawData) {
      return rawData
        .filter((page) => !page.url.endsWith("/")) // Filter out index pages
        .map((page) => {
          const frontmatter = page.frontmatter;

          // Calculate reading time
          const content = page.src || "";
          const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
          const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
          const totalWords = chineseChars + englishWords;
          const readingTime = Math.max(1, Math.ceil(totalWords / 200));

          return {
            title: frontmatter.title || "Untitled",
            description: frontmatter.description || "",
            date: frontmatter.date || new Date().toISOString().split("T")[0],
            lastModified: frontmatter.lastModified,
            url: page.url,
            tags: frontmatter.tags || [],
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
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
    },
  },
);

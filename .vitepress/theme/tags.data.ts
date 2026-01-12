import { createContentLoader } from "vitepress";

export interface TagInfo {
  name: string;
  count: number;
  posts: {
    title: string;
    url: string;
    date: string;
  }[];
}

declare const data: TagInfo[];
export { data };

export default createContentLoader(
  ["articles/*.md", "research/*.md", "company-research/**/*.md"],
  {
    transform(rawData) {
      const tagMap = new Map<string, TagInfo>();

      rawData
        .filter((page) => !page.url.endsWith("/"))
        .forEach((page) => {
          const frontmatter = page.frontmatter;
          const tags = frontmatter.tags || [];
          const postInfo = {
            title: frontmatter.title || "Untitled",
            url: page.url,
            date: frontmatter.date || "",
          };

          tags.forEach((tag: string) => {
            if (!tagMap.has(tag)) {
              tagMap.set(tag, { name: tag, count: 0, posts: [] });
            }
            const tagInfo = tagMap.get(tag)!;
            tagInfo.count++;
            tagInfo.posts.push(postInfo);
          });
        });

      // Sort tags by count (descending) and sort posts by date within each tag
      return Array.from(tagMap.values())
        .map((tag) => ({
          ...tag,
          posts: tag.posts.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        }))
        .sort((a, b) => b.count - a.count);
    },
  },
);

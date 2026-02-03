/**
 * 文章類別集中管理
 *
 * 新增類別時只需在此處修改，各元件會自動套用：
 * - ArticleHeader.vue
 * - Layout.vue
 * - ArticleList.vue
 * - posts.data.ts
 */

// 文章類別定義
export const ARTICLE_CATEGORIES = [
  "articles",
  "topic-research",
  "company-research",
] as const;

// 類別型別
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

// 檢查路徑是否為文章目錄
export function isArticlePath(path: string): boolean {
  return ARTICLE_CATEGORIES.some(
    (category) =>
      path.startsWith(`${category}/`) || path.startsWith(`/${category}/`),
  );
}

// 檢查是否為文章頁面（非 index）
export function isArticlePage(path: string): boolean {
  return isArticlePath(path) && !path.endsWith("index.md");
}

// 從路徑取得類別
export function getCategoryFromPath(path: string): ArticleCategory | null {
  for (const category of ARTICLE_CATEGORIES) {
    if (path.startsWith(`${category}/`) || path.startsWith(`/${category}/`)) {
      return category;
    }
  }
  return null;
}

// 類別對應的 URL 前綴（用於篩選文章）
export function getCategoryUrlPrefix(category: ArticleCategory): string {
  return `/${category}/`;
}

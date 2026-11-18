// 四個 content loader（posts.data.ts、tags.data.ts、rss.ts、llms-generator.ts）共用的收錄規則。
// 過去 glob 與篩選各寫一份，曾漂移成不存在的 research/*.md，文章靜默消失。

// 必須維持靜態陣列字面值：createContentLoader 依此建立 watch。
export const CONTENT_GLOBS = [
  "articles/*.md",
  "topic-research/*.md",
  "company-research/**/*.md",
];

const REQUIRED_FIELDS = ["title", "description", "date"] as const;

interface ContentPage {
  url: string;
  frontmatter: Record<string, unknown>;
}

// 目錄頁與草稿不收錄；其餘頁面必須通過驗證，否則建置失敗並指出檔案與欄位。
export function isPublishedPost(page: ContentPage): boolean {
  if (page.url.endsWith("/")) return false;
  if (page.frontmatter.draft) return false;
  validateFrontmatter(page);
  return true;
}

function validateFrontmatter({ url, frontmatter }: ContentPage): void {
  const problems: string[] = REQUIRED_FIELDS.filter(
    (field) => !frontmatter[field],
  ).map((field) => `缺少必填欄位 ${field}`);

  if (frontmatter.tags !== undefined && !Array.isArray(frontmatter.tags)) {
    problems.push("tags 必須是陣列");
  }

  if (problems.length > 0) {
    throw new Error(`frontmatter 驗證失敗：${url}（${problems.join("、")}）`);
  }
}

// YAML 未加引號的日期會解析成 Date；統一輸出 YYYY-MM-DD，避免帶出建置機器的時區名稱。
export function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter, page } = useData()

// Format date to Chinese format (2025 年 12 月 3 日)
function formatDateChinese(dateStr: string | Date | undefined): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${year} 年 ${month} 月 ${day} 日`
}

const formattedDate = computed(() => formatDateChinese(frontmatter.value.date))

// Format last modified date
const formattedLastModified = computed(() => formatDateChinese(frontmatter.value.lastModified))

// Calculate reading time from page content
const readingTime = computed(() => {
  if (frontmatter.value.readingTime) {
    return frontmatter.value.readingTime
  }
  return 5
})

// Check if this is an article page (by category or path)
const isArticlePage = computed(() => {
  const category = frontmatter.value.category
  if (category === 'articles' || category === 'company-research' || category === 'research') {
    return true
  }
  const path = page.value.relativePath
  const isInContentDir = path.startsWith('articles/') || path.startsWith('research/') || path.startsWith('company-research/')
  return isInContentDir && !path.endsWith('index.md')
})

// Get tags
const tags = computed(() => frontmatter.value.tags || [])

// Get author
const author = computed(() => frontmatter.value.author || 'Clement Tang')
</script>

<template>
  <div v-if="isArticlePage && formattedDate" class="article-header">
    <!-- Tags first (like category labels) -->
    <div v-if="tags.length" class="header-tags">
      <span v-for="tag in tags" :key="tag" class="header-tag">
        {{ tag }}
      </span>
    </div>

    <!-- Meta line: Author · Date · Reading Time -->
    <div class="header-meta">
      <span class="meta-author">{{ author }}</span>
      <span class="meta-separator">·</span>
      <span class="meta-date">{{ formattedDate }}</span>
      <span class="meta-separator">·</span>
      <span class="meta-reading-time">{{ readingTime }} 分鐘閱讀</span>
      <template v-if="formattedLastModified">
        <span class="meta-separator">·</span>
        <span class="meta-modified">更新於 {{ formattedLastModified }}</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.article-header {
  margin-bottom: 1.5rem;
}

/* Tags - small labels */
.header-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.header-tag {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  font-size: 0.75rem;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-radius: 3px;
}

/* Meta line */
.header-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}

.meta-author {
  color: var(--vp-c-text-2);
}

.meta-separator {
  color: var(--vp-c-text-3);
}

.meta-date {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
}

.meta-reading-time,
.meta-modified {
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
}
</style>

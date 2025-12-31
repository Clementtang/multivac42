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
  return (path.startsWith('articles/') || path.startsWith('research/')) && !path.endsWith('index.md')
})

// Get tags
const tags = computed(() => frontmatter.value.tags || [])

// Get author
const author = computed(() => frontmatter.value.author || 'Clement Tang')
</script>

<template>
  <div v-if="isArticlePage && formattedDate" class="article-header">
    <!-- Byline: Author · Date · Reading Time -->
    <div class="header-byline">
      <span class="byline-author">{{ author }}</span>
      <span class="byline-separator">·</span>
      <span class="byline-date">{{ formattedDate }}</span>
      <span class="byline-separator">·</span>
      <span class="byline-reading-time">{{ readingTime }} 分鐘閱讀</span>
    </div>

    <!-- Last Modified -->
    <div v-if="formattedLastModified" class="header-last-modified">
      最後修改：{{ formattedLastModified }}
    </div>

    <!-- Tags with # prefix -->
    <div v-if="tags.length" class="header-tags">
      <span v-for="tag in tags" :key="tag" class="header-tag">
        #{{ tag }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.article-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

/* Byline styles */
.header-byline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}

.byline-author {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.byline-separator {
  color: var(--vp-c-text-3);
}

.byline-date {
  color: var(--vp-c-text-2);
}

.byline-reading-time {
  color: var(--vp-c-text-3);
}

/* Last modified */
.header-last-modified {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  margin-bottom: 0.75rem;
}

/* Tags */
.header-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.header-tag {
  font-size: 0.9rem;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.header-tag:hover {
  opacity: 0.8;
}
</style>

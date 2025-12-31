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

// Get title
const title = computed(() => frontmatter.value.title || '')

// Get feature image
const featureImage = computed(() => frontmatter.value.image || frontmatter.value.featureImage || null)

// Get image alt text
const imageAlt = computed(() => frontmatter.value.imageAlt || title.value)
</script>

<template>
  <div v-if="isArticlePage && formattedDate" class="article-header">
    <!-- Title -->
    <h1 class="article-title">{{ title }}</h1>

    <!-- Byline: Author · Date · Reading Time -->
    <div class="header-byline">
      <span class="byline-author">{{ author }}</span>
      <span class="byline-separator">·</span>
      <span class="byline-date">{{ formattedDate }}</span>
      <span class="byline-separator">·</span>
      <span class="byline-reading-time">{{ readingTime }} 分鐘閱讀</span>
      <template v-if="formattedLastModified">
        <span class="byline-separator">·</span>
        <span class="byline-modified">更新於 {{ formattedLastModified }}</span>
      </template>
    </div>

    <!-- Tags -->
    <div v-if="tags.length" class="header-tags">
      <span v-for="tag in tags" :key="tag" class="header-tag">
        {{ tag }}
      </span>
    </div>

    <!-- Feature Image -->
    <figure v-if="featureImage" class="feature-image">
      <img :src="featureImage" :alt="imageAlt" loading="lazy" />
    </figure>
  </div>
</template>

<style scoped>
.article-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

/* Title */
.article-title {
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.3;
  margin: 0 0 0.75rem 0;
  color: var(--vp-c-text-1);
}

/* Byline: Author · Date · Reading Time */
.header-byline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.75rem;
}

.byline-author {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.byline-separator {
  color: var(--vp-c-text-3);
  margin: 0 0.1rem;
}

.byline-date {
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
}

.byline-reading-time {
  color: var(--vp-c-text-3);
}

.byline-modified {
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
}

/* Tags */
.header-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.header-tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-radius: 4px;
  transition: background 0.2s ease;
}

.header-tag:hover {
  background: rgba(245, 158, 11, 0.2);
}

/* Feature Image */
.feature-image {
  margin: 1.5rem 0 0 0;
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.feature-image img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 480px;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.feature-image:hover img {
  transform: scale(1.02);
}
</style>

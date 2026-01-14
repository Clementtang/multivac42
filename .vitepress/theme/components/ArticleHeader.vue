<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from '../posts.data'

const { frontmatter, page } = useData()

// Get current post data from posts.data.ts
const currentPost = computed(() => {
  const currentPath = page.value.relativePath.replace(/\.md$/, '').replace(/\/index$/, '')
  const normalizedCurrentPath = currentPath.replace(/^\//, '')

  return posts.find(post => {
    // Normalize URLs for comparison - handle with/without leading slash and trailing slash
    const normalizedPostUrl = post.url.replace(/^\//, '').replace(/\/$/, '')
    return normalizedPostUrl === normalizedCurrentPath
  })
})

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

// Get reading time and word count from post data
const readingTime = computed(() => {
  if (currentPost.value?.readingTime) {
    return currentPost.value.readingTime
  }
  if (frontmatter.value.readingTime) {
    return frontmatter.value.readingTime
  }
  return 5
})

const wordCount = computed(() => {
  return currentPost.value?.wordCount || 0
})

// Format word count with thousands separator
const formattedWordCount = computed(() => {
  const count = wordCount.value
  if (count === 0) return null
  return count.toLocaleString('zh-TW')
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

// Check if article is new (within last 7 days)
const isNew = computed(() => {
  const date = frontmatter.value.date
  if (!date) return false
  const publishDate = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 7
})

// Check if article was recently updated (within last 14 days)
const isRecentlyUpdated = computed(() => {
  const lastModified = frontmatter.value.lastModified
  const date = frontmatter.value.date
  if (!lastModified || lastModified === date) return false
  const modifiedDate = new Date(lastModified)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - modifiedDate.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 14
})

// Get feature image (support cover, image, featureImage)
const featureImage = computed(() => frontmatter.value.cover || frontmatter.value.image || frontmatter.value.featureImage || null)

// Get image alt text
const imageAlt = computed(() => frontmatter.value.imageAlt || title.value)
</script>

<template>
  <div v-if="isArticlePage && formattedDate" class="article-header">
    <!-- Status Badges -->
    <div v-if="isNew || isRecentlyUpdated" class="article-badges">
      <span v-if="isNew" class="status-badge new-badge">新文章</span>
      <span v-if="isRecentlyUpdated" class="status-badge updated-badge">近期更新</span>
    </div>

    <!-- Title -->
    <h1 class="article-title">{{ title }}</h1>

    <!-- Byline: Author · Date · Reading Time -->
    <div class="header-byline">
      <span class="byline-author">{{ author }}</span>
      <span class="byline-separator">·</span>
      <span class="byline-date">{{ formattedDate }}</span>
      <span class="byline-separator">·</span>
      <span class="byline-reading-time">{{ readingTime }} 分鐘閱讀</span>
      <template v-if="formattedWordCount">
        <span class="byline-separator">·</span>
        <span class="byline-word-count">{{ formattedWordCount }} 字</span>
      </template>
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

.byline-word-count {
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
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

/* Status Badges */
.article-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-family: var(--vp-font-family-mono);
  font-weight: 600;
  border-radius: 4px;
}

.new-badge {
  color: #fff;
  background: #10b981;
}

.updated-badge {
  color: #fff;
  background: #3b82f6;
}
</style>

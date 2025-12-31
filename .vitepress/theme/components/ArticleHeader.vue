<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter, page } = useData()

// Format date
const formattedDate = computed(() => {
  const date = frontmatter.value.date
  if (!date) return null
  const d = new Date(date)
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Calculate reading time from page content
const readingTime = computed(() => {
  // Use frontmatter readingTime if available, otherwise estimate
  if (frontmatter.value.readingTime) {
    return frontmatter.value.readingTime
  }
  // Default estimate based on typical article length
  return 5
})

// Check if this is an article page
const isArticlePage = computed(() => {
  const path = page.value.relativePath
  return path.startsWith('articles/') || path.startsWith('research/')
})

// Get tags
const tags = computed(() => frontmatter.value.tags || [])

// Get author
const author = computed(() => frontmatter.value.author || 'Clement Tang')

// Get description
const description = computed(() => frontmatter.value.description || '')
</script>

<template>
  <div v-if="isArticlePage && (tags.length || formattedDate)" class="article-header">
    <!-- Tags -->
    <div v-if="tags.length" class="header-tags">
      <span v-for="tag in tags" :key="tag" class="header-tag">
        {{ tag }}
      </span>
    </div>

    <!-- Description -->
    <p v-if="description" class="header-description">
      {{ description }}
    </p>

    <!-- Meta info -->
    <div class="header-meta">
      <span class="meta-author">{{ author }}</span>
      <span class="meta-separator">·</span>
      <span v-if="formattedDate" class="meta-date">{{ formattedDate }}</span>
      <span class="meta-separator">·</span>
      <span class="meta-reading-time">{{ readingTime }} min read</span>
    </div>
  </div>
</template>

<style scoped>
.article-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.header-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.header-tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 4px;
}

.header-description {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  margin: 1rem 0;
}

.header-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.meta-author {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.meta-separator {
  color: var(--vp-c-text-3);
}

.meta-date {
  font-family: var(--vp-font-family-mono);
}

.meta-reading-time {
  color: var(--vp-c-text-3);
}
</style>

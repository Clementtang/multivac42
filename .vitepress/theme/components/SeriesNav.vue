<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from '../posts.data'

const { page, frontmatter } = useData()

// Get current article's series info
const currentSeries = computed(() => frontmatter.value.series)
const seriesTitle = computed(() => frontmatter.value.seriesTitle || currentSeries.value)

// Get all posts in the same series, sorted by seriesIndex
const seriesPosts = computed(() => {
  if (!currentSeries.value) return []

  return posts
    .filter(post => post.series === currentSeries.value)
    .sort((a, b) => (a.seriesIndex || 0) - (b.seriesIndex || 0))
})

// Current article's URL for comparison
const currentUrl = computed(() => page.value.relativePath.replace(/\.md$/, '').replace(/index$/, ''))

// Find current article index in series
const currentIndex = computed(() => {
  const idx = seriesPosts.value.findIndex(post => {
    const postPath = post.url.replace(/^\//, '').replace(/\/$/, '')
    return postPath === currentUrl.value
  })
  return idx + 1
})

// Only show if there are multiple posts in the series
const shouldShow = computed(() => currentSeries.value && seriesPosts.value.length > 1)
</script>

<template>
  <div v-if="shouldShow" class="series-nav">
    <div class="series-header">
      <div class="series-title-row">
        <span class="series-icon">&#128218;</span>
        <span class="series-title">{{ seriesTitle }}</span>
      </div>
      <span class="series-progress">第 {{ currentIndex }} 篇，共 {{ seriesPosts.length }} 篇</span>
    </div>
    <ul class="series-list">
      <li
        v-for="(post, idx) in seriesPosts"
        :key="post.url"
        :class="{ active: idx + 1 === currentIndex }"
      >
        <a :href="post.url" :class="{ current: idx + 1 === currentIndex }">
          <span class="series-number">{{ idx + 1 }}.</span>
          <span class="series-post-title">{{ post.title }}</span>
          <span v-if="idx + 1 === currentIndex" class="current-badge">目前閱讀</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.series-nav {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
}

.series-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.series-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.series-icon {
  font-size: 1.25rem;
}

.series-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.series-progress {
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-alt);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.series-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.series-list li {
  margin: 0;
}

.series-list a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  margin: 0 -0.75rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--vp-c-text-2);
  transition: all 0.2s ease;
}

.series-list a:hover {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
}

.series-list li.active a {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.series-number {
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  min-width: 1.5rem;
}

.series-post-title {
  flex: 1;
  font-weight: 500;
}

.current-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background: var(--vp-c-brand-1);
  color: #000;
  border-radius: 10px;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .series-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .series-progress {
    align-self: flex-start;
  }

  .current-badge {
    display: none;
  }
}
</style>

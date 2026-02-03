<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from '../posts.data'

interface Props {
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: 3
})

const { page, frontmatter } = useData()

const currentUrl = computed(() => page.value.relativePath.replace(/\.md$/, ''))
const currentTags = computed(() => frontmatter.value.tags || [])
// 使用 Set 優化 tag 查詢效能 (O(1) vs O(n))
const currentTagsSet = computed(() => new Set(currentTags.value))

const relatedPosts = computed(() => {
  if (currentTags.value.length === 0) return []

  const tagSet = currentTagsSet.value

  // Score posts by number of matching tags
  const scored = posts
    .filter(post => {
      // Exclude current post
      const postUrl = post.url.replace(/\/$/, '')
      return postUrl !== `/${currentUrl.value}` && postUrl !== currentUrl.value
    })
    .map(post => {
      // 使用 Set.has() 進行 O(1) 查詢
      let score = 0
      for (const tag of post.tags) {
        if (tagSet.has(tag)) score++
      }
      return { ...post, score }
    })
    .filter(post => post.score > 0)
    .sort((a, b) => {
      // Sort by score first, then by date
      if (b.score !== a.score) return b.score - a.score
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  return scored.slice(0, props.limit)
})

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div v-if="relatedPosts.length > 0" class="related-posts">
    <h3 class="related-title">相關文章</h3>
    <div class="related-grid">
      <a
        v-for="post in relatedPosts"
        :key="post.url"
        :href="post.url"
        class="related-card"
      >
        <div class="related-meta">
          <span class="related-date">{{ formatDate(post.date) }}</span>
          <span v-if="post.readingTime" class="related-time">
            · {{ post.readingTime }} min
          </span>
        </div>
        <h4 class="related-card-title">{{ post.title }}</h4>
        <div v-if="post.tags.length > 0" class="related-tags">
          <span
            v-for="tag in post.tags.slice(0, 2)"
            :key="tag"
            class="related-tag"
            :class="{ matched: currentTagsSet.has(tag) }"
          >
            {{ tag }}
          </span>
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.related-posts {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}

.related-title {
  margin: 0 0 1.25rem 0;
  font-family: var(--vp-font-family-mono);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.related-card {
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.related-card:hover {
  border-color: var(--vp-c-brand-1);
}

.related-card:hover .related-card-title {
  color: var(--vp-c-brand-1);
}

.related-meta {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  margin-bottom: 0.5rem;
}

.related-date {
  font-family: var(--vp-font-family-mono);
}

.related-card-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--vp-c-text-1);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.related-tag {
  padding: 0.125rem 0.5rem;
  font-size: 0.7rem;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-alt);
  border-radius: 3px;
}

.related-tag.matched {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

@media (max-width: 768px) {
  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>

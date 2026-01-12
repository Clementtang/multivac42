<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../posts.data'
import ArticleCard from './ArticleCard.vue'

interface Props {
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: 4
})

// Get posts with featured ones first, then by date
const latestPosts = computed(() => {
  // Separate featured and non-featured posts
  const featured = posts.filter(p => p.featured)
  const nonFeatured = posts.filter(p => !p.featured)

  // Combine: featured first, then non-featured
  const combined = [...featured, ...nonFeatured]
  return combined.slice(0, props.limit)
})
</script>

<template>
  <section class="latest-posts">
    <div class="latest-posts-container">
      <div class="section-header">
        <h2 class="section-title">最新文章</h2>
        <a href="/articles/" class="view-all">查看全部 →</a>
      </div>
      <div class="posts-grid">
        <ArticleCard
          v-for="post in latestPosts"
          :key="post.url"
          :title="post.title"
          :description="post.description"
          :date="post.date"
          :url="post.url"
          :tags="post.tags"
          :author="post.author"
          :cover="post.cover"
          :reading-time="post.readingTime"
          :featured="post.featured"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.latest-posts {
  padding: 3rem 24px 4rem;
  background: var(--vp-c-bg);
}

.latest-posts-container {
  max-width: 1088px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-family: var(--vp-font-family-mono);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.view-all {
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.view-all:hover {
  opacity: 0.8;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>

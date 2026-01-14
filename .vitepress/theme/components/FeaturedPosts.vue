<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../posts.data'

interface Props {
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: 3
})

// 篩選精選文章
const featuredPosts = computed(() => {
  return posts
    .filter(p => p.featured)
    .slice(0, props.limit)
})

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <section v-if="featuredPosts.length > 0" class="featured-posts">
    <div class="featured-posts-container">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">★</span>
          精選文章
        </h2>
      </div>

      <div class="posts-list">
        <a
          v-for="(post, index) in featuredPosts"
          :key="post.url"
          :href="post.url"
          class="post-item"
        >
          <span class="post-rank">{{ index + 1 }}</span>
          <div class="post-content">
            <h3 class="post-title">{{ post.title }}</h3>
            <div class="post-meta">
              <span class="post-date">{{ formatDate(post.date) }}</span>
              <span v-if="post.readingTime" class="post-reading-time">
                · {{ post.readingTime }} min
              </span>
            </div>
            <p v-if="post.description" class="post-description">
              {{ post.description }}
            </p>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.featured-posts {
  padding: 3rem 24px 2rem;
  background: var(--vp-c-bg);
}

.featured-posts-container {
  max-width: 1088px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--vp-font-family-mono);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.title-icon {
  color: var(--vp-c-brand-1);
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.post-item:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
}

.post-item:hover .post-title {
  color: var(--vp-c-brand-1);
}

.post-rank {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-family: var(--vp-font-family-mono);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-radius: 50%;
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--vp-c-text-1);
  transition: color 0.2s ease;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.post-date {
  font-family: var(--vp-font-family-mono);
}

.post-reading-time {
  color: var(--vp-c-text-3);
}

.post-description {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 640px) {
  .post-item {
    flex-direction: column;
    gap: 0.75rem;
  }

  .post-rank {
    width: 28px;
    height: 28px;
    font-size: 1rem;
  }
}
</style>

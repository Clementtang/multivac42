<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  description?: string
  date: string
  url: string
  tags?: string[]
  author?: string
  cover?: string
  readingTime?: number
  featured?: boolean
}

const props = defineProps<Props>()

// Format date to readable string
const formattedDate = computed(() => {
  const date = new Date(props.date)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Calculate reading time display
const readingTimeText = computed(() => {
  if (props.readingTime) {
    return `${props.readingTime} min`
  }
  return null
})
</script>

<template>
  <a :href="url" class="article-card" :class="{ featured }">
    <div class="card-cover">
      <span v-if="featured" class="featured-badge">Featured</span>
      <img
        v-if="cover"
        :src="cover"
        :alt="title"
        class="cover-image"
      />
      <div v-else class="cover-placeholder">
        <span class="placeholder-icon">M42</span>
      </div>
    </div>
    <div class="card-content">
      <div class="card-meta">
        <span class="card-date">{{ formattedDate }}</span>
        <span v-if="readingTimeText" class="card-reading-time">
          · {{ readingTimeText }}
        </span>
      </div>
      <h3 class="card-title">{{ title }}</h3>
      <p v-if="description" class="card-description">{{ description }}</p>
      <div v-if="tags && tags.length > 0" class="card-tags">
        <span v-for="tag in tags.slice(0, 3)" :key="tag" class="tag">
          {{ tag }}
        </span>
      </div>
    </div>
  </a>
</template>

<style scoped>
.article-card {
  display: block;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  transition: all 0.3s ease;
}

.article-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 24px rgba(245, 158, 11, 0.15);
}

.card-cover {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--vp-c-bg-alt);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-card:hover .cover-image {
  transform: scale(1.03);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,
    var(--vp-c-bg-alt) 0%,
    rgba(245, 158, 11, 0.1) 50%,
    var(--vp-c-bg-alt) 100%
  );
}

.placeholder-icon {
  font-family: var(--vp-font-family-mono);
  font-size: 2rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  opacity: 0.3;
}

.card-content {
  padding: 1.25rem;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.card-date {
  font-family: var(--vp-font-family-mono);
}

.card-reading-time {
  color: var(--vp-c-text-3);
}

.card-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--vp-c-text-1);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card:hover .card-title {
  color: var(--vp-c-brand-1);
}

.card-description {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 4px;
}

/* Featured article styles */
.article-card.featured {
  border-color: var(--vp-c-brand-1);
}

.featured-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 1;
  padding: 0.25rem 0.75rem;
  font-size: 0.7rem;
  font-family: var(--vp-font-family-mono);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #000;
  background: var(--vp-c-brand-1);
  border-radius: 4px;
}
</style>

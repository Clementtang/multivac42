<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { data as tags } from '../tags.data'

const selectedTag = ref<string | null>(null)

// 監聽 URL query 參數，支援從熱門標籤跳轉時自動選中
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const tagParam = urlParams.get('tag')
  if (tagParam && tags.some(t => t.name === tagParam)) {
    selectedTag.value = tagParam
  }
})

const sortedTags = computed(() => tags)

const filteredPosts = computed(() => {
  if (!selectedTag.value) return []
  const tag = tags.find(t => t.name === selectedTag.value)
  return tag?.posts || []
})

function selectTag(tagName: string) {
  if (selectedTag.value === tagName) {
    selectedTag.value = null
  } else {
    selectedTag.value = tagName
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="tags-page">
    <div class="tags-cloud">
      <button
        v-for="tag in sortedTags"
        :key="tag.name"
        class="tag-button"
        :class="{ active: selectedTag === tag.name }"
        @click="selectTag(tag.name)"
      >
        {{ tag.name }}
        <span class="tag-count">{{ tag.count }}</span>
      </button>
    </div>

    <div v-if="selectedTag" class="tag-posts">
      <h3 class="posts-title">
        <span class="tag-label">{{ selectedTag }}</span>
        的文章（{{ filteredPosts.length }} 篇）
      </h3>
      <ul class="posts-list">
        <li v-for="post in filteredPosts" :key="post.url" class="post-item">
          <a :href="post.url" class="post-link">
            <span class="post-title">{{ post.title }}</span>
            <span class="post-date">{{ formatDate(post.date) }}</span>
          </a>
        </li>
      </ul>
    </div>

    <div v-else class="tag-hint">
      <p>點擊標籤查看相關文章</p>
    </div>
  </div>
</template>

<style scoped>
.tags-page {
  padding: 1rem 0;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.tag-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.tag-button.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #000;
}

.tag-button.active .tag-count {
  background: rgba(0, 0, 0, 0.2);
  color: #000;
}

.tag-count {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  background: var(--vp-c-bg-alt);
  border-radius: 10px;
  color: var(--vp-c-text-2);
}

.tag-posts {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
}

.posts-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.tag-label {
  padding: 0.25rem 0.75rem;
  font-family: var(--vp-font-family-mono);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 4px;
}

.posts-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.post-item {
  border-bottom: 1px solid var(--vp-c-divider);
}

.post-item:last-child {
  border-bottom: none;
}

.post-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  text-decoration: none;
  transition: color 0.2s ease;
}

.post-link:hover .post-title {
  color: var(--vp-c-brand-1);
}

.post-title {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.post-date {
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  margin-left: 1rem;
}

.tag-hint {
  padding: 2rem;
  text-align: center;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px dashed var(--vp-c-border);
  border-radius: 12px;
}

@media (max-width: 640px) {
  .post-link {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .post-date {
    margin-left: 0;
  }
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from '../posts.data'

const { site } = useData()

// Get 3 random recent posts to suggest
const suggestedPosts = ref(posts.slice(0, 3))

onMounted(() => {
  // Shuffle and pick 3 random posts
  const shuffled = [...posts].sort(() => Math.random() - 0.5)
  suggestedPosts.value = shuffled.slice(0, 3)
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
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">
        <span class="code-4">4</span>
        <span class="code-0">0</span>
        <span class="code-4">4</span>
      </div>

      <h1 class="error-title">頁面不存在</h1>
      <p class="error-message">
        抱歉，您要找的頁面可能已移動、刪除，或從未存在。
      </p>

      <div class="error-actions">
        <a href="/" class="action-btn primary">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          返回首頁
        </a>
        <a href="/articles/" class="action-btn secondary">
          瀏覽所有文章
        </a>
      </div>

      <div class="suggested-posts">
        <h3 class="suggested-title">或許您想看這些文章</h3>
        <div class="suggested-grid">
          <a
            v-for="post in suggestedPosts"
            :key="post.url"
            :href="post.url"
            class="suggested-card"
          >
            <span class="suggested-date">{{ formatDate(post.date) }}</span>
            <span class="suggested-post-title">{{ post.title }}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 2rem;
}

.not-found-content {
  max-width: 560px;
  text-align: center;
}

.error-code {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-family: var(--vp-font-family-mono);
  font-size: 5rem;
  font-weight: 700;
  line-height: 1;
}

.code-4 {
  color: var(--vp-c-text-1);
}

.code-0 {
  color: var(--vp-c-brand-1);
}

.error-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.error-message {
  margin: 0 0 2rem 0;
  font-size: 1rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.action-btn.primary {
  color: #000;
  background: var(--vp-c-brand-1);
}

.action-btn.primary:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-1px);
}

.action-btn.secondary {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
}

.action-btn.secondary:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.suggested-posts {
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}

.suggested-title {
  margin: 0 0 1.25rem 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.suggested-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.suggested-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  text-align: left;
  text-decoration: none;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.suggested-card:hover {
  border-color: var(--vp-c-brand-1);
}

.suggested-card:hover .suggested-post-title {
  color: var(--vp-c-brand-1);
}

.suggested-date {
  font-size: 0.75rem;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
}

.suggested-post-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.2s ease;
}

@media (max-width: 640px) {
  .error-code {
    font-size: 3.5rem;
  }

  .error-actions {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }
}
</style>

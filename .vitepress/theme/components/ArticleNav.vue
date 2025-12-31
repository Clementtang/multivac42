<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import { data as posts } from '../posts.data'

// Get current page URL
const route = useRoute()

// Find current article and its neighbors
const navigation = computed(() => {
  const currentPath = route.path

  // Determine category from current path
  const isArticle = currentPath.startsWith('/articles/')
  const isResearch = currentPath.startsWith('/research/')
  const isCompanyResearch = currentPath.startsWith('/company-research/')

  if (!isArticle && !isResearch && !isCompanyResearch) {
    return { prev: null, next: null }
  }

  // Filter posts by same category
  const categoryPosts = posts.filter(post => {
    if (isArticle) return post.url.startsWith('/articles/')
    if (isResearch) return post.url.startsWith('/research/')
    if (isCompanyResearch) return post.url.startsWith('/company-research/')
    return false
  })

  // Find current post index
  const currentIndex = categoryPosts.findIndex(post =>
    post.url === currentPath || post.url === currentPath + '/'
  )

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  // Posts are sorted by date descending, so:
  // - "next" (newer) is at index - 1
  // - "prev" (older) is at index + 1
  return {
    prev: currentIndex < categoryPosts.length - 1 ? categoryPosts[currentIndex + 1] : null,
    next: currentIndex > 0 ? categoryPosts[currentIndex - 1] : null
  }
})
</script>

<template>
  <nav v-if="navigation.prev || navigation.next" class="article-nav">
    <a
      v-if="navigation.prev"
      :href="navigation.prev.url"
      class="nav-link nav-prev"
    >
      <span class="nav-label">上一篇</span>
      <span class="nav-title">{{ navigation.prev.title }}</span>
    </a>
    <div v-else class="nav-placeholder"></div>

    <a
      v-if="navigation.next"
      :href="navigation.next.url"
      class="nav-link nav-next"
    >
      <span class="nav-label">下一篇</span>
      <span class="nav-title">{{ navigation.next.title }}</span>
    </a>
    <div v-else class="nav-placeholder"></div>
  </nav>
</template>

<style scoped>
.article-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-border);
}

.nav-link {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-link:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-alt);
}

.nav-prev {
  text-align: left;
}

.nav-next {
  text-align: right;
}

.nav-label {
  font-size: 0.8rem;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-prev .nav-label::before {
  content: '← ';
}

.nav-next .nav-label::after {
  content: ' →';
}

.nav-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.nav-link:hover .nav-title {
  color: var(--vp-c-brand-1);
}

.nav-placeholder {
  min-height: 1px;
}

@media (max-width: 640px) {
  .article-nav {
    grid-template-columns: 1fr;
  }

  .nav-next {
    text-align: left;
  }

  .nav-next .nav-label::before {
    content: '';
  }

  .nav-next .nav-label::after {
    content: ' →';
  }
}
</style>

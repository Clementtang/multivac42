<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../posts.data'
import ArticleCard from './ArticleCard.vue'
import { type ArticleCategory, getCategoryUrlPrefix } from '../config/categories'

interface Props {
  category?: ArticleCategory
}

const props = withDefaults(defineProps<Props>(), {
  category: 'articles'
})

// Filter and sort posts by category and date
// 使用集中管理的類別設定
const filteredPosts = computed(() => {
  const urlPrefix = getCategoryUrlPrefix(props.category)
  return posts
    .filter(post => post.url.startsWith(urlPrefix))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})
</script>

<template>
  <div class="article-list">
    <div class="article-grid">
      <ArticleCard
        v-for="post in filteredPosts"
        :key="post.url"
        :title="post.title"
        :description="post.description"
        :date="post.date"
        :url="post.url"
        :tags="post.tags"
        :author="post.author"
        :cover="post.cover"
        :reading-time="post.readingTime"
      />
    </div>
    <div v-if="filteredPosts.length === 0" class="no-posts">
      <p>目前還沒有內容</p>
    </div>
  </div>
</template>

<style scoped>
.article-list {
  margin-top: 1.5rem;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .article-grid {
    grid-template-columns: 1fr;
  }
}

.no-posts {
  text-align: center;
  padding: 3rem;
  color: var(--vp-c-text-2);
}

.no-posts p {
  font-size: 1.125rem;
}
</style>

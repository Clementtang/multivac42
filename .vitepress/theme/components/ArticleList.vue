<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../posts.data'
import ArticleCard from './ArticleCard.vue'

interface Props {
  category?: 'articles' | 'research' | 'company-research' | 'topic-research'
}

const props = withDefaults(defineProps<Props>(), {
  category: 'articles'
})

// Filter and sort posts by category and date
const filteredPosts = computed(() => {
  return posts
    .filter(post => {
      // Filter by category based on URL path
      if (props.category === 'articles') {
        return post.url.startsWith('/articles/')
      } else if (props.category === 'research') {
        return post.url.startsWith('/research/')
      } else if (props.category === 'company-research') {
        return post.url.startsWith('/company-research/')
      } else if (props.category === 'topic-research') {
        return post.url.startsWith('/topic-research/')
      }
      return true
    })
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
})

// Calculate reading time from content
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  // Count Chinese characters and English words
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length
  const totalWords = chineseChars + englishWords
  return Math.ceil(totalWords / wordsPerMinute)
}
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

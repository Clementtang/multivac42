<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ArticleHeader from './components/ArticleHeader.vue'
import ArticleNav from './components/ArticleNav.vue'
import LatestPosts from './components/LatestPosts.vue'

const { Layout } = DefaultTheme
const { page, frontmatter } = useData()

// Check if current page is an article (not index)
const isArticlePage = computed(() => {
  const path = page.value.relativePath
  const isInArticleDir = path.startsWith('articles/') || path.startsWith('research/') || path.startsWith('company-research/')
  const isNotIndex = !path.endsWith('index.md')
  return isInArticleDir && isNotIndex
})

// Check if current page is home
const isHomePage = computed(() => frontmatter.value.layout === 'home')
</script>

<template>
  <Layout>
    <!-- Insert ArticleHeader before doc content (will render our title + byline) -->
    <template #doc-before>
      <ArticleHeader />
    </template>
    <!-- Insert ArticleNav at bottom of doc -->
    <template #doc-after>
      <ArticleNav v-if="isArticlePage" />
    </template>
    <!-- Insert LatestPosts after home features -->
    <template #home-features-after>
      <LatestPosts v-if="isHomePage" :limit="4" />
    </template>
  </Layout>
</template>

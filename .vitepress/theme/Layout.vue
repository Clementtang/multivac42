<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ArticleHeader from './components/ArticleHeader.vue'
import ArticleNav from './components/ArticleNav.vue'

const { Layout } = DefaultTheme
const { page } = useData()

// Check if current page is an article (not index)
const isArticlePage = computed(() => {
  const path = page.value.relativePath
  const isInArticleDir = path.startsWith('articles/') || path.startsWith('research/') || path.startsWith('company-research/')
  const isNotIndex = !path.endsWith('index.md')
  return isInArticleDir && isNotIndex
})
</script>

<template>
  <Layout>
    <!-- Insert ArticleHeader - using doc-top which renders after the title -->
    <template #doc-top>
      <ArticleHeader v-if="isArticlePage" />
    </template>

    <!-- Insert ArticleNav at bottom of doc -->
    <template #doc-after>
      <ArticleNav v-if="isArticlePage" />
    </template>
  </Layout>
</template>

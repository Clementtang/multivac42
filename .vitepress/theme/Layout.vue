<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ArticleHeader from './components/ArticleHeader.vue'
import ArticleFooter from './components/ArticleFooter.vue'
import ArticleNav from './components/ArticleNav.vue'
import LatestPosts from './components/LatestPosts.vue'
import FeaturedPosts from './components/FeaturedPosts.vue'
import PopularTags from './components/PopularTags.vue'
import ShareButtons from './components/ShareButtons.vue'
import ReadingProgress from './components/ReadingProgress.vue'
import RelatedPosts from './components/RelatedPosts.vue'
import SeriesNav from './components/SeriesNav.vue'
import BackToTop from './components/BackToTop.vue'
import Comments from './components/Comments.vue'
import FloatingToc from './components/FloatingToc.vue'
import NotFound from './components/NotFound.vue'
import PageTransition from './components/PageTransition.vue'
import TextSelectionShare from './components/TextSelectionShare.vue'

const { Layout } = DefaultTheme
const { page, frontmatter } = useData()

// Check if current page is an article (not index)
const isArticlePage = computed(() => {
  const path = page.value.relativePath
  const isInArticleDir = path.startsWith('articles/') || path.startsWith('research/') || path.startsWith('company-research/') || path.startsWith('topic-research/')
  const isNotIndex = !path.endsWith('index.md')
  return isInArticleDir && isNotIndex
})

// Check if current page is home
const isHomePage = computed(() => frontmatter.value.layout === 'home')
</script>

<template>
  <!-- B-03: 頁面載入動畫 -->
  <PageTransition />
  <!-- SH-03: 文字選取分享 -->
  <TextSelectionShare />
  <Layout>
    <!-- Reading progress bar for articles -->
    <template #layout-top>
      <ReadingProgress v-if="isArticlePage" />
    </template>
    <!-- Insert ArticleHeader before doc content (will render our title + byline) -->
    <template #doc-before>
      <ArticleHeader />
    </template>
    <!-- Insert ArticleFooter, ShareButtons, SeriesNav, RelatedPosts, Comments and ArticleNav at bottom of doc -->
    <template #doc-after>
      <ArticleFooter v-if="isArticlePage" />
      <ShareButtons v-if="isArticlePage" />
      <SeriesNav v-if="isArticlePage" />
      <RelatedPosts v-if="isArticlePage" :limit="3" />
      <Comments v-if="isArticlePage" />
      <ArticleNav v-if="isArticlePage" />
    </template>
    <!-- Insert featured posts, latest posts and popular tags after home features -->
    <template #home-features-after>
      <FeaturedPosts v-if="isHomePage" :limit="3" />
      <LatestPosts v-if="isHomePage" :limit="4" />
      <PopularTags v-if="isHomePage" :limit="10" />
    </template>
    <!-- Global back to top button and floating TOC -->
    <template #layout-bottom>
      <FloatingToc v-if="isArticlePage" />
      <BackToTop />
    </template>
    <!-- Custom 404 page -->
    <template #not-found>
      <NotFound />
    </template>
  </Layout>
</template>

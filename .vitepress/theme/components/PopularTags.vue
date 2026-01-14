<script setup lang="ts">
import { computed } from 'vue'
import { data as tags } from '../tags.data'

interface Props {
  limit?: number
  showCount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10,
  showCount: true
})

// tags.data.ts 已按 count 降序排列，直接取前 N 個
const popularTags = computed(() => tags.slice(0, props.limit))

// 計算標籤大小（基於使用次數）
function getTagSize(count: number): string {
  const maxCount = tags[0]?.count || 1
  const ratio = count / maxCount
  if (ratio > 0.7) return 'large'
  if (ratio > 0.4) return 'medium'
  return 'small'
}
</script>

<template>
  <section class="popular-tags">
    <div class="popular-tags-container">
      <div class="section-header">
        <h2 class="section-title">熱門標籤</h2>
        <a href="/tags" class="view-all">查看全部 →</a>
      </div>
      <div class="tags-cloud">
        <a
          v-for="tag in popularTags"
          :key="tag.name"
          :href="`/tags?tag=${encodeURIComponent(tag.name)}`"
          class="tag-item"
          :class="getTagSize(tag.count)"
        >
          {{ tag.name }}
          <span v-if="showCount" class="tag-count">{{ tag.count }}</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.popular-tags {
  padding: 2rem 24px 3rem;
  background: var(--vp-c-bg);
}

.popular-tags-container {
  max-width: 1088px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-title {
  font-family: var(--vp-font-family-mono);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.view-all {
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.view-all:hover {
  opacity: 0.8;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.tag-item:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

/* 標籤大小變化 */
.tag-item.small {
  font-size: 0.85rem;
  padding: 0.375rem 0.75rem;
}

.tag-item.medium {
  font-size: 0.9rem;
}

.tag-item.large {
  font-size: 1rem;
  font-weight: 500;
}

.tag-count {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  background: var(--vp-c-bg-alt);
  border-radius: 10px;
  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>

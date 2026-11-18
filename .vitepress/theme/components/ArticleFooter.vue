<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()

// Format date to Chinese format (2025 年 12 月 3 日)
function formatDateChinese(dateStr: string | Date | undefined): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${year} 年 ${month} 月 ${day} 日`
}

const formattedLastModified = computed(() => formatDateChinese(frontmatter.value.lastModified))

// Article-page gating lives in Layout.vue (shared categories.ts); duplicating it here
// once drifted to a stale `research/` path and hid every topic-research update date.
// Only show if there's a lastModified date different from publish date
const showLastModified = computed(() => {
  const lastModified = frontmatter.value.lastModified
  const date = frontmatter.value.date
  return lastModified && lastModified !== date
})
</script>

<template>
  <div v-if="showLastModified" class="article-footer">
    <div class="last-modified">
      <span class="modified-label">最後更新於</span>
      <span class="modified-date">{{ formattedLastModified }}</span>
    </div>
  </div>
</template>

<style scoped>
.article-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--vp-c-divider);
}

.last-modified {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
}

.modified-label {
  color: var(--vp-c-text-3);
}

.modified-date {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
}
</style>

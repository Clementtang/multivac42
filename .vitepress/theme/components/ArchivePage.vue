<script setup lang="ts">
import { ref, computed } from 'vue'
import { data as posts } from '../posts.data'

interface YearGroup {
  year: number
  posts: typeof posts
}

// 按年份分組文章
const yearGroups = computed<YearGroup[]>(() => {
  const groups = new Map<number, typeof posts>()

  posts.forEach(post => {
    const year = new Date(post.date).getFullYear()
    if (!groups.has(year)) {
      groups.set(year, [])
    }
    groups.get(year)!.push(post)
  })

  // 轉換為陣列並按年份降序排列
  return Array.from(groups.entries())
    .map(([year, yearPosts]) => ({
      year,
      posts: yearPosts.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    }))
    .sort((a, b) => b.year - a.year)
})

// 管理展開狀態 - 預設展開最新年份
const expandedYears = ref<Set<number>>(new Set(
  yearGroups.value.length > 0 ? [yearGroups.value[0].year] : []
))

function toggleYear(year: number) {
  if (expandedYears.value.has(year)) {
    expandedYears.value.delete(year)
  } else {
    expandedYears.value.add(year)
  }
}

function isExpanded(year: number): boolean {
  return expandedYears.value.has(year)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric'
  })
}

// 統計總數
const totalPosts = computed(() => posts.length)
</script>

<template>
  <div class="archive-page">
    <div class="archive-stats">
      <span class="total-count">共 {{ totalPosts }} 篇文章</span>
    </div>

    <div class="year-list">
      <div
        v-for="group in yearGroups"
        :key="group.year"
        class="year-group"
      >
        <button
          class="year-header"
          :class="{ expanded: isExpanded(group.year) }"
          @click="toggleYear(group.year)"
        >
          <span class="year-label">{{ group.year }}</span>
          <span class="post-count">{{ group.posts.length }} 篇</span>
          <span class="expand-icon">
            {{ isExpanded(group.year) ? '−' : '+' }}
          </span>
        </button>

        <Transition name="slide">
          <ul v-if="isExpanded(group.year)" class="posts-list">
            <li v-for="post in group.posts" :key="post.url" class="post-item">
              <a :href="post.url" class="post-link">
                <span class="post-date">{{ formatDate(post.date) }}</span>
                <span class="post-title">{{ post.title }}</span>
                <span v-if="post.featured" class="featured-badge">精選</span>
              </a>
            </li>
          </ul>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.archive-page {
  padding: 1rem 0;
}

.archive-stats {
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  text-align: center;
}

.total-count {
  font-family: var(--vp-font-family-mono);
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
}

.year-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.year-group {
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  overflow: hidden;
}

.year-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1rem 1.25rem;
  background: var(--vp-c-bg-soft);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.year-header:hover {
  background: var(--vp-c-bg-alt);
}

.year-header.expanded {
  border-bottom: 1px solid var(--vp-c-border);
}

.year-label {
  font-family: var(--vp-font-family-mono);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.post-count {
  margin-left: auto;
  margin-right: 1rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-alt);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.expand-icon {
  font-family: var(--vp-font-family-mono);
  font-size: 1.25rem;
  color: var(--vp-c-text-2);
  width: 24px;
  text-align: center;
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
  align-items: center;
  padding: 0.875rem 1.25rem;
  text-decoration: none;
  transition: background 0.2s ease;
}

.post-link:hover {
  background: var(--vp-c-bg-soft);
}

.post-link:hover .post-title {
  color: var(--vp-c-brand-1);
}

.post-date {
  flex-shrink: 0;
  width: 60px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}

.post-title {
  flex: 1;
  color: var(--vp-c-text-1);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.featured-badge {
  flex-shrink: 0;
  margin-left: 0.75rem;
  padding: 0.125rem 0.5rem;
  font-size: 0.7rem;
  font-family: var(--vp-font-family-mono);
  color: #000;
  background: var(--vp-c-brand-1);
  border-radius: 4px;
}

/* 展開/收合動畫 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 2000px;
}

@media (max-width: 640px) {
  .post-link {
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .post-date {
    width: auto;
    margin-right: 0.75rem;
  }

  .post-title {
    width: 100%;
    white-space: normal;
  }
}
</style>

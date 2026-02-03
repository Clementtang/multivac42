<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useData } from 'vitepress'

interface TocItem {
  id: string
  text: string
  level: number
}

const { page } = useData()
const isOpen = ref(false)
const showButton = ref(false)
const activeId = ref('')
const tocItems = ref<TocItem[]>([])

// Parse headers from the page
function parseHeaders() {
  const headers = document.querySelectorAll('.vp-doc h2, .vp-doc h3')
  tocItems.value = Array.from(headers).map((header) => ({
    id: header.id,
    text: header.textContent?.replace(/\s*#\s*$/, '') || '',
    level: parseInt(header.tagName[1]),
  }))
}

// Track active section
function updateActiveSection() {
  const headers = document.querySelectorAll('.vp-doc h2, .vp-doc h3')
  const scrollY = window.scrollY + 100

  for (let i = headers.length - 1; i >= 0; i--) {
    const header = headers[i] as HTMLElement
    if (header.offsetTop <= scrollY) {
      activeId.value = header.id
      return
    }
  }
  activeId.value = ''
}

function handleScroll() {
  showButton.value = window.scrollY > 200 && tocItems.value.length > 2
  updateActiveSection()
}

function scrollToHeader(id: string) {
  const element = document.getElementById(id)
  if (element) {
    const offset = 80
    const y = element.offsetTop - offset
    window.scrollTo({ top: y, behavior: 'smooth' })
    isOpen.value = false
  }
}

function toggleToc() {
  isOpen.value = !isOpen.value
}

// Close when clicking outside
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.floating-toc')) {
    isOpen.value = false
  }
}

onMounted(async () => {
  // 等待 DOM 完全渲染後再解析 headers，避免 race condition
  await nextTick()
  parseHeaders()
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleClickOutside)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})

// Re-parse headers when page changes
watch(() => page.value.relativePath, async () => {
  isOpen.value = false
  // 等待新頁面 DOM 渲染完成
  await nextTick()
  parseHeaders()
})
</script>

<template>
  <div v-if="showButton" class="floating-toc">
    <button
      class="toc-toggle"
      :class="{ active: isOpen }"
      @click="toggleToc"
      title="目錄"
      aria-label="顯示目錄"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="15" y2="18"/>
      </svg>
    </button>

    <Transition name="toc-panel">
      <div v-show="isOpen" class="toc-panel">
        <div class="toc-header">
          <span>目錄</span>
          <button class="toc-close" @click="isOpen = false" aria-label="關閉目錄">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav class="toc-nav">
          <a
            v-for="item in tocItems"
            :key="item.id"
            :href="`#${item.id}`"
            :class="['toc-link', `level-${item.level}`, { active: activeId === item.id }]"
            @click.prevent="scrollToHeader(item.id)"
          >
            {{ item.text }}
          </a>
        </nav>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.floating-toc {
  position: fixed;
  bottom: 5rem;
  right: 2rem;
  z-index: 49;
}

.toc-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 50%;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.toc-toggle:hover,
.toc-toggle.active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.toc-panel {
  position: absolute;
  bottom: 56px;
  right: 0;
  width: 280px;
  max-height: 400px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}

.toc-close {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toc-close:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.toc-nav {
  padding: 0.5rem;
  max-height: 340px;
  overflow-y: auto;
}

.toc-link {
  display: block;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.15s ease;
  line-height: 1.4;
}

.toc-link:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.toc-link.active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.toc-link.level-3 {
  padding-left: 1.5rem;
  font-size: 0.8rem;
}

/* Transitions */
.toc-panel-enter-active,
.toc-panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toc-panel-enter-from,
.toc-panel-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Hide on desktop when outline is visible */
@media (min-width: 1280px) {
  .floating-toc {
    display: none;
  }
}

@media (max-width: 768px) {
  .floating-toc {
    bottom: 4.5rem;
    right: 1.5rem;
  }

  .toc-toggle {
    width: 40px;
    height: 40px;
  }

  .toc-panel {
    width: 260px;
    right: -0.5rem;
  }
}
</style>

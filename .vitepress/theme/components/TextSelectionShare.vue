<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()

const isVisible = ref(false)
const position = ref({ x: 0, y: 0 })
const selectedText = ref('')

const siteUrl = 'https://multivac42.com'

const pageUrl = computed(() => {
  const path = page.value.relativePath.replace(/\.md$/, '').replace(/index$/, '')
  return `${siteUrl}/${path}`
})

const twitterUrl = computed(() => {
  const text = encodeURIComponent(`"${selectedText.value}"`)
  const url = encodeURIComponent(pageUrl.value)
  return `https://twitter.com/intent/tweet?text=${text}&url=${url}`
})

const linkedinUrl = computed(() => {
  const url = encodeURIComponent(pageUrl.value)
  return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
})

function handleMouseUp(e: MouseEvent) {
  const selection = window.getSelection()
  const text = selection?.toString().trim() || ''

  // 只在文章內容區域啟用
  const target = e.target as HTMLElement
  if (!target.closest('.vp-doc')) {
    hidePopup()
    return
  }

  // 至少選取 10 個字元
  if (text.length < 10) {
    hidePopup()
    return
  }

  // 限制選取文字長度（用於分享）
  selectedText.value = text.length > 280 ? text.slice(0, 277) + '...' : text

  // 取得選取範圍的位置
  const range = selection?.getRangeAt(0)
  if (range) {
    const rect = range.getBoundingClientRect()
    position.value = {
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY - 10,
    }
    isVisible.value = true
  }
}

function hidePopup() {
  isVisible.value = false
  selectedText.value = ''
}

function handleScroll() {
  hidePopup()
}

function copyQuote() {
  const quote = `"${selectedText.value}" — ${pageUrl.value}`
  navigator.clipboard.writeText(quote)
  hidePopup()
}

function shareToTwitter() {
  window.open(twitterUrl.value, '_blank', 'width=550,height=420')
  hidePopup()
}

function shareToLinkedIn() {
  window.open(linkedinUrl.value, '_blank', 'width=550,height=420')
  hidePopup()
}

onMounted(() => {
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="popup">
      <div
        v-if="isVisible"
        class="text-selection-share"
        :style="{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }"
      >
        <button
          class="share-btn"
          title="分享到 Twitter"
          aria-label="分享選取文字到 Twitter"
          @click="shareToTwitter"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>
        <button
          class="share-btn"
          title="分享到 LinkedIn"
          aria-label="分享選取文字到 LinkedIn"
          @click="shareToLinkedIn"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </button>
        <button
          class="share-btn"
          title="複製引用"
          aria-label="複製選取文字"
          @click="copyQuote"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <div class="share-arrow" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* SH-03: 文字選取分享 */
.text-selection-share {
  position: absolute;
  transform: translateX(-50%) translateY(-100%);
  display: flex;
  gap: 2px;
  padding: 6px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.15s ease;
}

.share-btn:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
}

.share-arrow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--vp-c-border);
}

.share-arrow::after {
  content: '';
  position: absolute;
  top: -7px;
  left: -5px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid var(--vp-c-bg-elv);
}

/* 動畫 */
.popup-enter-active,
.popup-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-90%);
}

/* 行動裝置隱藏（選取體驗不佳） */
@media (max-width: 768px) {
  .text-selection-share {
    display: none;
  }
}
</style>

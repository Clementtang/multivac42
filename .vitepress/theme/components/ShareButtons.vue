<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'

const { page, frontmatter, site } = useData()

const copied = ref(false)

const pageUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.href
  }
  return ''
})

const pageTitle = computed(() => frontmatter.value.title || page.value.title || '')

const twitterUrl = computed(() => {
  const text = encodeURIComponent(pageTitle.value)
  const url = encodeURIComponent(pageUrl.value)
  return `https://twitter.com/intent/tweet?text=${text}&url=${url}`
})

const linkedinUrl = computed(() => {
  const url = encodeURIComponent(pageUrl.value)
  return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
})

const facebookUrl = computed(() => {
  const url = encodeURIComponent(pageUrl.value)
  return `https://www.facebook.com/sharer/sharer.php?u=${url}`
})

async function copyLink() {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(pageUrl.value)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
}
</script>

<template>
  <div class="share-buttons">
    <span class="share-label">分享文章</span>
    <div class="share-icons">
      <a
        :href="twitterUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="share-btn twitter"
        title="分享到 Twitter"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      <a
        :href="linkedinUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="share-btn linkedin"
        title="分享到 LinkedIn"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
      <a
        :href="facebookUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="share-btn facebook"
        title="分享到 Facebook"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      <button
        class="share-btn copy"
        :class="{ copied }"
        @click="copyLink"
        :title="copied ? '已複製!' : '複製連結'"
      >
        <svg v-if="!copied" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.share-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--vp-c-divider);
}

.share-label {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
}

.share-icons {
  display: flex;
  gap: 0.5rem;
}

.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.share-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.share-btn.twitter:hover {
  background: rgba(29, 161, 242, 0.1);
  border-color: #1da1f2;
  color: #1da1f2;
}

.share-btn.linkedin:hover {
  background: rgba(0, 119, 181, 0.1);
  border-color: #0077b5;
  color: #0077b5;
}

.share-btn.facebook:hover {
  background: rgba(24, 119, 242, 0.1);
  border-color: #1877f2;
  color: #1877f2;
}

.share-btn.copy.copied {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
  color: #22c55e;
}

@media (max-width: 640px) {
  .share-buttons {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>

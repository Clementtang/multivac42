<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useData } from 'vitepress'

const { isDark, page } = useData()
const container = ref<HTMLElement | null>(null)

// Giscus configuration
// To set up: visit https://giscus.app and fill in your repo details
const giscusConfig = {
  repo: 'Clementtang/multivac42',
  repoId: '', // Get from giscus.app
  category: 'Comments',
  categoryId: '', // Get from giscus.app
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  lang: 'zh-TW',
}

function loadGiscus() {
  if (!container.value) return

  // Remove existing giscus if any
  const existingScript = container.value.querySelector('.giscus')
  if (existingScript) {
    existingScript.remove()
  }

  // Skip if not configured
  if (!giscusConfig.repoId || !giscusConfig.categoryId) {
    return
  }

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  script.setAttribute('data-repo', giscusConfig.repo)
  script.setAttribute('data-repo-id', giscusConfig.repoId)
  script.setAttribute('data-category', giscusConfig.category)
  script.setAttribute('data-category-id', giscusConfig.categoryId)
  script.setAttribute('data-mapping', giscusConfig.mapping)
  script.setAttribute('data-strict', giscusConfig.strict)
  script.setAttribute('data-reactions-enabled', giscusConfig.reactionsEnabled)
  script.setAttribute('data-emit-metadata', giscusConfig.emitMetadata)
  script.setAttribute('data-input-position', giscusConfig.inputPosition)
  script.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  script.setAttribute('data-lang', giscusConfig.lang)

  container.value.appendChild(script)
}

function updateTheme() {
  const iframe = document.querySelector<HTMLIFrameElement>('.giscus-frame')
  if (iframe) {
    iframe.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: isDark.value ? 'dark' : 'light' } } },
      'https://giscus.app'
    )
  }
}

onMounted(() => {
  loadGiscus()
})

// Reload giscus when page changes
watch(() => page.value.relativePath, () => {
  loadGiscus()
})

// Update theme when dark mode changes
watch(isDark, () => {
  updateTheme()
})
</script>

<template>
  <div class="comments-section">
    <h3 class="comments-title">留言討論</h3>
    <div ref="container" class="giscus-container">
      <!-- Giscus will be loaded here -->
      <div v-if="!giscusConfig.repoId" class="comments-placeholder">
        <p>留言功能尚未設定。</p>
        <p class="placeholder-hint">
          設定方式：前往
          <a href="https://giscus.app" target="_blank" rel="noopener">giscus.app</a>
          取得 repoId 和 categoryId
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comments-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}

.comments-title {
  margin: 0 0 1.5rem 0;
  font-family: var(--vp-font-family-mono);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.giscus-container {
  min-height: 100px;
}

.comments-placeholder {
  padding: 2rem;
  text-align: center;
  background: var(--vp-c-bg-soft);
  border: 1px dashed var(--vp-c-border);
  border-radius: 8px;
  color: var(--vp-c-text-2);
}

.comments-placeholder p {
  margin: 0.5rem 0;
}

.placeholder-hint {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}

.placeholder-hint a {
  color: var(--vp-c-brand-1);
}
</style>

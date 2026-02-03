<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vitepress'

const router = useRouter()
const isLoading = ref(false)
const progress = ref(0)

let progressTimer: ReturnType<typeof setInterval> | null = null

function startProgress() {
  isLoading.value = true
  progress.value = 0

  // 模擬進度條前進
  progressTimer = setInterval(() => {
    if (progress.value < 90) {
      // 快速到達 30%，然後逐漸變慢
      const increment = progress.value < 30 ? 10 : progress.value < 60 ? 5 : 2
      progress.value = Math.min(90, progress.value + increment)
    }
  }, 100)
}

function completeProgress() {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  progress.value = 100

  // 完成後淡出
  setTimeout(() => {
    isLoading.value = false
    progress.value = 0
  }, 300)
}

// 監聽路由變化
watch(
  () => router.route.path,
  () => {
    startProgress()
    // 頁面載入完成後結束進度條
    setTimeout(completeProgress, 200)
  }
)
</script>

<template>
  <Transition name="progress">
    <div v-if="isLoading" class="page-progress">
      <div class="page-progress-bar" :style="{ width: `${progress}%` }" />
    </div>
  </Transition>
</template>

<style scoped>
/* B-03: 頁面載入動畫 */
.page-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 9999;
  pointer-events: none;
}

.page-progress-bar {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--vp-c-brand-1) 0%,
    var(--vp-c-brand-2) 50%,
    var(--vp-c-brand-1) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  transition: width 0.2s ease-out;
  box-shadow: 0 0 10px var(--vp-c-brand-1);
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 進度條淡入淡出 */
.progress-enter-active,
.progress-leave-active {
  transition: opacity 0.3s ease;
}

.progress-enter-from,
.progress-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const progress = ref(0);
const milestones = new Set<number>();

function sendScrollEvent(depth: number) {
  const win = window as any;
  if (win.gtag) {
    win.gtag("event", "scroll_depth", {
      percent_scrolled: depth,
      page_path: window.location.pathname,
    });
  }
}

function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight > 0) {
    progress.value = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
  }

  for (const threshold of [25, 50, 75, 100]) {
    if (progress.value >= threshold && !milestones.has(threshold)) {
      milestones.add(threshold);
      sendScrollEvent(threshold);
    }
  }
}

onMounted(() => {
  milestones.clear();
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
});

onUnmounted(() => {
  window.removeEventListener("scroll", updateProgress);
});
</script>

<template>
  <div class="reading-progress-container">
    <div class="reading-progress-bar" :style="{ width: `${progress}%` }" />
  </div>
</template>

<style scoped>
.reading-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  z-index: 100;
}

.reading-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  transition: width 0.1s ease-out;
}
</style>

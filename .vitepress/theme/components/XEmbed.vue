<script setup lang="ts">
import { ref, onMounted } from "vue";

const props = defineProps<{
  tweetId: string;
}>();

const container = ref<HTMLElement>();

function loadWidgets(): Promise<void> {
  const win = window as any;
  if (win.twttr?.widgets) return Promise.resolve();
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

onMounted(async () => {
  await loadWidgets();
  const win = window as any;
  win.twttr?.widgets?.createTweet(props.tweetId, container.value, {
    align: "center",
    lang: "en",
  });
});
</script>

<template>
  <div ref="container" class="x-embed" />
</template>

<style scoped>
.x-embed {
  margin: 1.5rem 0;
}
</style>

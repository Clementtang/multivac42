<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  tweetId: string
}>()

const container = ref<HTMLElement>()

onMounted(() => {
  const win = window as any
  if (win.twttr?.widgets) {
    win.twttr.widgets.createTweet(props.tweetId, container.value, {
      align: 'center',
      lang: 'en',
    })
  }
})
</script>

<template>
  <div ref="container" class="x-embed" />
</template>

<style scoped>
.x-embed {
  margin: 1.5rem 0;
}
</style>

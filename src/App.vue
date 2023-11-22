<template>
  <div class="tw-bg-gray-50 dark:tw-bg-stone-800">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useDarkStore } from 'src/stores/darkModeStore';
import { watch } from 'vue';

const darkStore = useDarkStore();

watch(() => darkStore.isDark, (isDark) => {
  const body = document.querySelector('#root-body');
  if (!body) {
    return;
  }
  if (isDark && !body.classList.contains('tw-dark')) {
    body.classList.add('tw-dark');
  } else if (!isDark && body.classList.contains('tw-dark')) {
    body.classList.remove('tw-dark');
  }
}, {
  immediate: true,
});
</script>

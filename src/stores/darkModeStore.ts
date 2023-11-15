import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useDarkStore = defineStore('darkMode', () => {
  const colorScheme = ref<'dark' | 'light' | 'system'>('system');

  const isDark = computed(
    () => {
      if (colorScheme.value === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return colorScheme.value === 'dark';
    },
  );

  return {
    colorScheme,
    isDark,
  };
});

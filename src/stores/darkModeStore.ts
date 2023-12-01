import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

export type ThemeMode = 'dark' | 'light' | 'system';

export const useDarkStore = defineStore('darkMode', () => {
  const colorScheme = ref<ThemeMode>('system');

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

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

  const themeKey = 'defaultTheme';

  // Retrieve the default theme from local storage
  const defaultTheme = localStorage.getItem(themeKey) as ThemeMode | undefined;
  colorScheme.value = defaultTheme ?? 'system';

  watch(colorScheme, (newValue) => {
    localStorage.setItem(themeKey, newValue);
  });

  return {
    colorScheme,
    isDark,
  };
});

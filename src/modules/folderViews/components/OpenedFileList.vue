<template>
  <q-list
    separator
    :dark="dark"
  >
    <q-item
      v-for="repo in markdownsStore.repos" :key="repo.id"
      clickable
      v-ripple
      dense
    >
      <q-item-section avator class="tw-flex-none">
        <q-icon name="description" color="primary" />
      </q-item-section>
      <q-item-section class="tw-text-stone-800 dark:tw-text-stone-300">
        {{ repo.edit.split('\n')[0] }}
      </q-item-section>
      <q-item-section side>
        <q-icon
          v-if="repo.id !== id"
          name="cancel"
          class="tw-cursor-pointer tw-bg-white dark:tw-bg-stone-700 dark:tw-text-stone-300"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useMarkdownsStore } from 'src/modules/markdown/stores/markdownsStore';

const markdownsStore = useMarkdownsStore();

withDefaults(defineProps<{
  dark?: boolean,
  id: string,
}>(), {
  dark: false,
});
</script>

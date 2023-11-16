<template>
  <div>
    <MarkdownEditor
      splitter-class="tw-h-[calc(100vh-75px)]"
      v-model="mdText"
      type="split"
      :is-dark="darkStore.isDark"
    ></MarkdownEditor>
  </div>
</template>

<script setup lang="ts">
import MarkdownEditor from 'src/modules/markdown/components/MarkdownEditor.vue';
import { useDarkStore } from 'src/stores/darkModeStore';
import { ref } from 'vue';

const mdText = ref('');

const darkStore = useDarkStore();
</script>

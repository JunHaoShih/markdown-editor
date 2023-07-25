<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      class="main-panel"
    >
      <template v-slot:before>
        <q-input
          v-model="mdText"
          type="textarea"
          autogrow
          class="left-panel"
        />
      </template>
      <template v-slot:after>
        <markdown-viewer
          v-model="mdText"
          class="q-ma-sm"
        />
      </template>
    </q-splitter>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MarkdownViewer from './components/MarkdownViewer.vue';

const splitterModel = ref(50);

const mdText = ref('');
</script>

<style lang="sass" scoped>
.main-panel
  height: calc( 100vh - 50px )
</style>

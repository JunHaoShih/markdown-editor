<template>
  <div class="">
    <q-layout view="lHh lpr lFf">
      <q-header elevated>
        <q-toolbar class="bg-dark">
          <q-toolbar-title>
            Markdown Editor
          </q-toolbar-title>
        </q-toolbar>
      </q-header>
      <q-page-container>
        <q-page>
          <MarkdownEditor
            splitter-class="editor-body"
            v-model="mdText"
          ></MarkdownEditor>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup lang="ts">
import MarkdownEditor from 'src/modules/markdown/components/MarkdownEditor.vue';
import { ref } from 'vue';

const mdText = ref('');
</script>

<style lang="sass" scoped>
:deep(.editor-body)
  height: calc( 100vh - 50px )
</style>

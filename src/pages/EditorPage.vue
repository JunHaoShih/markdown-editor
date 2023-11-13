<template>
  <div class="">
    <q-layout view="lHh lpr lFf">
      <q-header elevated>
        <title-bar title="Markdown Editor">
        </title-bar>
      </q-header>
      <q-page-container>
        <q-page>
          <MarkdownEditor
            splitter-class="editor-body"
            v-model="mdText"
            type="split"
          ></MarkdownEditor>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup lang="ts">
import TitleBar from 'src/components/TitleBar.vue';
import MarkdownEditor from 'src/modules/markdown/components/MarkdownEditor.vue';
import { ref } from 'vue';

const mdText = ref('');
</script>

<style lang="sass" scoped>
:deep(.editor-body)
  height: calc( 100vh - 50px )
</style>

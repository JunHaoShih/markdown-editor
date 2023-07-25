<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      class="main-panel"
    >
      <template v-slot:before>
        <q-input
          v-model="mdText"
          filled
          type="textarea"
        />
      </template>
      <template v-slot:after>
          <div v-html="markdown"></div>
      </template>
    </q-splitter>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';

const splitterModel = ref(50);

const mdText = ref('');

const md: MarkdownIt = new MarkdownIt({
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch (__) { /* empty */ }
    }

    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

const markdown = computed(
  () => md.render(DOMPurify.sanitize(mdText.value)),
);
</script>

<style lang="sass" scoped>
.main-panel
  height: calc( 100vh - 50px )
</style>

<template>
  <div>
    <div v-html="markdown"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

const props = defineProps<{
  modelValue: string,
}>();

type Emit = {
  (e: 'update:modelValue', value: string): void,
}
const emit = defineEmits<Emit>();

const mdText = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

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
  () => md.render(mdText.value),
);
</script>

<style lang="sass" scoped>
.main-panel
  height: calc( 100vh - 50px )

/* markdown styles */
:deep(code)
  color: #c7254e
  background-color: #f9f2f4
  border-radius: 4px
  padding: 2px 4px

:deep(pre code)
  padding: 0
  font-size: inherit
  color: inherit
  background-color: transparent
  border-radius: 0

:deep(table)
  border: 1px solid hsla(0,0%,50%,.33)
  border-collapse: collapse

:deep(thead)
  display: table-header-group
  vertical-align: middle
  border-color: inherit

:deep(tr)
  display: table-row
  vertical-align: inherit
  border-color: inherit

:deep(th)
  display: table-cell
  vertical-align: inherit
  font-weight: bold
  padding: 8px
  border: 1px solid hsla(0,0%,50%,.33)

:deep(tr th)
  border-bottom-width: 2px

:deep(tbody)
  display: table-row-group
  vertical-align: middle
  border-color: inherit

:deep(td)
  padding: 8px
  border: 1px solid hsla(0,0%,50%,.33)

:deep(h1),
:deep(h2),
:deep(h3),
:deep(h4),
:deep(h5),
:deep(h6)
  line-height: 1

:deep(h1)
  font-size: 2em
  font-weight: bold

:deep(h1:after),
:deep(h2:after)
  content: ''
  display: block
  position: relative
  top: 0.33em
  border-bottom: 1px solid hsla(0,0%,50%,.33)

:deep(h2)
  font-size: 1.5em
  font-weight: bold

:deep(h3)
  font-size: 1.17em
  font-weight: bold

:deep(h4)
  font-size: 1em
  font-weight: bold

:deep(h5)
  font-size: 0.83em
  font-weight: bold

:deep(h6)
  font-size: 0.67em
  font-weight: bold
</style>

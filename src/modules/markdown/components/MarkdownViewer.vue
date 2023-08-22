<template>
  <div>
    <div v-html="markdown"></div>
  </div>
</template>

<script setup lang="ts">
import {
  computed, onMounted, onUpdated,
} from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();

const i18n = useI18n();

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
        return `<pre class="hljs"><button class="action-btn">Copy</button><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch (__) { /* empty */ }
    }

    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

const markdown = computed(
  () => md.render(mdText.value),
);

function addCopyEvent() {
  const highlights = document.querySelectorAll('pre.hljs');
  highlights.forEach((div) => {
    const btn = div.querySelector('button');
    btn?.addEventListener('click', () => {
      if (div.children.length !== 2) {
        $q.notify({
          type: 'error',
          message: i18n.t('unknownError'),
        });
        return;
      }

      const text = div.children[1].textContent;
      if (text) {
        navigator.clipboard.writeText(text);
        $q.notify({
          type: 'success',
          message: i18n.t('actions.copyToClipboard'),
        });
      }
    });
  });
}

onUpdated(() => {
  addCopyEvent();
});

onMounted(() => {
  addCopyEvent();
});
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

:deep(pre.hljs button)
  transition: 0.2s ease-out
  cursor: pointer
  position: absolute
  margin-right: 12px
  margin-top: -2px
  opacity: 0.5
  right: 0
</style>

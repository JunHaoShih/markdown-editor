<template>
  <div>
    <div ref="mdRef" v-html="markdown"></div>
  </div>
</template>

<script setup lang="ts">
import {
  computed, onMounted, ref,
} from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { v4 as uuidv4 } from 'uuid';

const $q = useQuasar();

const i18n = useI18n();

const mdRef = ref<HTMLElement>();

const copyIcon = '<i class="q-icon notranslate material-icons" aria-hidden="true" role="img">content_copy</i>';

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
    const uuid = uuidv4();
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><button class="action-btn" data-clipboard-target=${uuid}>${copyIcon}</button><code id=${uuid}>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch (__) { /* empty */ }
    }

    return `<pre class="hljs"><button class="action-btn">${copyIcon}</button><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

const defaultLinkRender = md.renderer.rules.link_open
  || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

md.renderer.rules.link_open = ((tokens, idx, options, env, self) => {
  // If you are sure other plugins can't add `target` - drop check below
  const aIndex = tokens[idx].attrIndex('target');

  if (aIndex < 0) {
    tokens[idx].attrPush(['target', '_blank']); // add new attribute
  } else {
    tokens[idx].attrSet('target', '_blank');// replace value of existing attr
  }

  // pass token to default renderer.
  return defaultLinkRender(tokens, idx, options, env, self);
});

const markdown = computed(
  () => md.render(mdText.value),
);

function copyCLicked(evt: MouseEvent) {
  let target = evt.target as HTMLElement | null;
  if (!target) {
    return;
  }
  if (target.tagName.toLowerCase() === 'i') {
    target = target.parentElement;
  }
  const clipboardTargetId = target?.getAttribute('data-clipboard-target');

  if (clipboardTargetId) {
    const textToCopy = document.getElementById(clipboardTargetId)?.textContent;

    if (!textToCopy) {
      return;
    }

    navigator.clipboard.writeText(textToCopy);
    $q.notify({
      type: 'success',
      message: i18n.t('actions.copyToClipboard'),
    });
  }
}

onMounted(() => {
  mdRef.value?.addEventListener('click', copyCLicked);
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

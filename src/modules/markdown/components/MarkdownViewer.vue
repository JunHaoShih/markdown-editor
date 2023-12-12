<template>
  <div>
    <div
      ref="mdRef"
      v-html="markdown"
      class="tw-text-black dark:tw-text-stone-200
        result-html"
    ></div>
  </div>
</template>

<script setup lang="ts">
import {
  computed, onMounted, ref,
} from 'vue';
import MarkdownIt from 'markdown-it';
import emoji from 'markdown-it-emoji';
import footnote from 'markdown-it-footnote';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { CodeBlockOptions, codeBlockPlugin } from '../plugins/codeBlockPlugin';
import { mermaidPlugin } from '../plugins/mermaidPlugin';
import { anchorBlankPlugin } from '../plugins/anchorBlankPlugin';

const $q = useQuasar();

const i18n = useI18n();

const mdRef = ref<HTMLElement>();

const props = defineProps<{
  modelValue: string,
  isDark: boolean,
}>();

const colorTheme = computed(
  () => (props.isDark ? '#333333' : '#f9f9f9'),
);

type Emit = {
  (e: 'update:modelValue', value: string): void,
}
const emit = defineEmits<Emit>();

const mdText = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const md: MarkdownIt = new MarkdownIt();

const btnAttributeName = 'data-clipboard-target';

const codeblockOptions: CodeBlockOptions = {
  highlightClass: 'hljs',
  copyBtn: {
    btnClass: 'action-btn',
    attribute: btnAttributeName,
  },
  codeClass: 'mona-space-radon',
  titleClass: 'code-block-title',
  bodyClass: 'code-block-body',
};

md.use(emoji)
  .use(footnote)
  .use(codeBlockPlugin, codeblockOptions)
  .use(anchorBlankPlugin)
  .use(mermaidPlugin);

const markdown = computed(
  () => md.render(mdText.value),
);

/**
 * Handle code block copy
 * @param evt Mouse event
 */
function copyCLicked(evt: MouseEvent) {
  let target = evt.target as HTMLElement | null;
  if (!target) {
    return;
  }
  if (target.tagName.toLowerCase() === 'i') {
    target = target.parentElement;
  }
  const clipboardTargetId = target?.getAttribute(btnAttributeName);

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

/**
 * Handle anchor hash for Electron and Capacitor due to file protocol.<br/>
 * @param evt Mouse event
 */
function handleHashAnchor(evt: MouseEvent) {
  const target = evt.target as HTMLElement | null;
  if (!target) {
    return;
  }
  if (target.tagName.toLocaleLowerCase() !== 'a') {
    return;
  }
  const anchor = target as HTMLAnchorElement;
  if (!anchor.hash.startsWith('#')) {
    return;
  }
  evt.preventDefault();
  const scrollToElement = document.getElementById(anchor.hash.substring(1));
  if (!scrollToElement) {
    return;
  }
  // Instead of using default behavior, we find our element and scroll to it.
  // The reason I do this is because Electron and Capacitor cannot handle hash anchor properly.
  scrollToElement.scrollIntoView({
    behavior: 'smooth',
  });
}

onMounted(() => {
  mdRef.value?.addEventListener('click', copyCLicked);
  mdRef.value?.addEventListener('click', handleHashAnchor);
});
</script>

<style lang="sass" scoped>
/* markdown styles */

/* main */
:deep(.result-html)
  padding: 2px 10px
  overflow: auto
  display: block

/* ul ol */
:deep(ul),
:deep(ol)
  margin-top: 0
  margin-bottom: 0

:deep(ul)
  display: block
  list-style-type: disc
  margin-block-start: 1em
  margin-block-end: 1em
  margin-inline-start: opx
  margin-inline-end: 0px
  padding-inline-start: 25px

:deep(ul ul)
  list-style-type: circle

:deep(ul ul ul)
  list-style-type: square

:deep(ol)
  display: block
  list-style-type: decimal
  margin-block-start: 1em
  margin-block-end: 1em
  margin-inline-start: opx
  margin-inline-end: 0px
  padding-inline-start: 25px

/* blockquote style */
:deep(blockquote)
  display: block
  margin-block-start: 1em
  margin-block-end: 1em
  margin-inline-start: 40px
  margin-inline-end: 40px
  padding: 5px 15px
  margin: 0 0 0px
  font-size: 17.5px
  border-left: 5px solid #c792ea

/* li style */
:deep(li)
  display: list-item
  text-align: -webkit-match-parent

:deep(li::marker)
  unicode-bidi: isolate
  font-variant-numeric: tabular-nums
  text-transform: none
  text-indent: 0px !important
  text-align: start !important
  text-align-last: start !important

/* img style */
:deep(img)
  max-width: 35%
  vertical-align: middle
  border: 0
  overflow-clip-margin: content-box
  overflow: clip

/* p style */
:deep(p)
  display: block
  margin-block-start: 1em
  margin-block-end: 1em
  margin-inline-start: 0px
  margin-inline-end: 0px
  margin: 0 0 10px

:deep(b),
:deep(strong)
  font-weight: bold

/* link style */
:deep(a)
  color: #428bca
  text-decoration-line: underline
  background: transparent

:deep(a:visited)
  color: #1f64a1

/* hr style */
:deep(hr)
  margin-top: 20px
  margin-bottom: 20px
  border: 0
  border-top: 1px solid rgba(128, 128, 128, 0.33)

:deep(code)
  color: #c7254e
  background-color: #f9f2f4
  border-radius: 4px
  padding: 2px 4px

/* code block styles */
:deep(pre)
  border-radius: 10px

:deep(pre .code-block-title)
  display: flex
  position: relative
  background-color: #1f2937
  border-top-left-radius: 10px
  border-top-right-radius: 10px
  padding: 5px 18px
  align-items: center
  justify-content: space-between

:deep(pre .code-block-body)
  border-bottom-left-radius: 10px
  border-bottom-right-radius: 10px
  padding: 18px
  overflow-y: auto

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

:deep(tbody > tr:nth-child(odd) > td),
:deep(tbody > tr:nth-child(odd) > th)
  background-color: v-bind(colorTheme)

:deep(h1),
:deep(h2),
:deep(h3),
:deep(h4),
:deep(h5),
:deep(h6)
  line-height: 1
  margin-top: 16px
  margin-bottom: 16px

:deep(h1)
  font-size: 2em
  font-weight: bold

:deep(h1:after),
:deep(h2:after)
  content: ''
  display: block
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

:deep(pre.hljs)
  position: relative

:deep(pre.hljs pre)
  position: relative

:deep(pre.hljs button)
  transition: 0.2s ease-out
  cursor: pointer
  opacity: 0.8
  padding: 2px 5px 2px 5px
</style>

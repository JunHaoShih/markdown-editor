<template>
  <div ref="divDom"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor';
import {
  computed, onMounted, ref, watch,
} from 'vue';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

const divDom = ref<HTMLElement>();

let editor: monaco.editor.IStandaloneCodeEditor;

const props = defineProps<{
  modelValue: string,
}>();

type Emit = {
  (e: 'update:modelValue', value: string): void
}
const emit = defineEmits<Emit>();

const text = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

onMounted(() => {
  // eslint-disable-next-line no-restricted-globals
  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new JsonWorker();
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new CssWorker();
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new HtmlWorker();
      }
      if (label === 'typescript' || label === 'javascript') {
        return new TsWorker();
      }
      return new EditorWorker();
    },
  };
  if (divDom.value) {
    editor = monaco.editor.create(divDom.value, {
      value: text.value,
      language: 'markdown',
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
    });

    editor.onDidChangeModelContent(() => {
      text.value = editor.getValue();
    });
  }
});

watch(text, (newValue) => {
  const currentValue = editor.getValue();
  if (currentValue !== newValue) {
    editor.setValue(newValue);
  }
});
</script>

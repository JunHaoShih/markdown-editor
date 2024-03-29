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
  isDark: boolean,
}>();

type Emit = (e: 'update:modelValue', value: string) => void;

const emit = defineEmits<Emit>();

const text = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

onMounted(() => {
  if (!window.MonacoEnvironment) {
    window.MonacoEnvironment = {
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
  }
  if (divDom.value) {
    editor = monaco.editor.create(divDom.value, {
      value: text.value,
      language: 'markdown',
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalSliderSize: 10,
      },
      fontFamily: 'MonaspaceKrypton',
      fontLigatures: "'ss01', 'ss02', 'ss03', 'ss04', 'ss05', 'ss06', 'ss07', 'ss08', 'calt', 'dlig'",
      theme: props.isDark ? 'vs-dark' : 'vs',
    });

    editor.onDidChangeModelContent(() => {
      text.value = editor.getValue();
    });

    editor.getModel()
      ?.updateOptions({
        tabSize: 2,
      });
  }
});

watch(text, (newValue) => {
  const currentValue = editor.getValue();
  if (currentValue !== newValue) {
    editor.setValue(newValue);
  }
});

function focusEditor() {
  editor.focus();
}

defineExpose({
  focusEditor,
});
</script>

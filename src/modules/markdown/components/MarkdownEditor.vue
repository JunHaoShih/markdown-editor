<template>
  <div class="tw-flex tw-flex-row">
    <div ref="leftDiv" class="tw-w-full sm:tw-w-6/12">
      <MonacoEditor
        v-model="mdText"
        :class="`${splitterClass} q-pt-xs q-pr-sm`"
        :is-dark="isDark"
      ></MonacoEditor>
    </div>
    <div
      class="tw-w-2 tw-cursor-ew-resize tw-flex tw-flex-col tw-justify-center tw-items-center
      hover:tw-bg-stone-400"
      v-touch-pan.preserveCursor.prevent.mouse.touch.horizontal="resizeDrawer"
    >
      <div class="tw-bg-stone-400 tw-w-0.5 tw-flex-auto"></div>
    </div>
    <div class="tw-flex-1 tw-overflow-auto tw-relative">
      <markdown-viewer
        v-if="!hideViewer"
        v-model="mdText"
        :class="`${splitterClass} tw-mx-auto tw-max-w-7xl`"
        :is-dark="isDark"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed, defineAsyncComponent, ref, watch,
} from 'vue';
import LoadingPanel from 'src/components/LoadingPanel.vue';
import MarkdownViewer from './MarkdownViewer.vue';

export type EditorType = 'edit' | 'view' | 'split' | 'none';

const MonacoEditor = defineAsyncComponent({
  loader: () => import('src/components/MonacoEditor.vue'),
  loadingComponent: LoadingPanel,
  delay: 200,
});

const leftDiv = ref<HTMLElement>();

const props = withDefaults(defineProps<{
  modelValue: string,
  type: EditorType,
  isDark: boolean,
  splitterClass: string,
  hideViewer?: boolean,
}>(), {
  hideViewer: false,
});

type Emit = {
  (e: 'update:modelValue', value: string): void
  (e: 'onSplitterResize'): void
}
const emit = defineEmits<Emit>();

const mdText = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

watch(() => props.type, (newValue) => {
  if (!leftDiv.value) {
    return;
  }
  if (newValue === 'edit') {
    leftDiv.value.style.width = '100%';
  } else if (newValue === 'view') {
    leftDiv.value.style.width = '0%';
  } else {
    leftDiv.value.style.width = '50%';
  }
});

let initialDrawerWidth = 0;

function resizeDrawer(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  if (!leftDiv.value) {
    return;
  }
  if (details.isFirst) {
    initialDrawerWidth = leftDiv.value.offsetWidth;
  }
  if (details.offset?.x) {
    leftDiv.value.style.width = `${initialDrawerWidth + details.offset.x}px`;
    emit('onSplitterResize');
  }
}
</script>

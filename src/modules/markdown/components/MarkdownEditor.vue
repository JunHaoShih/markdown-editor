<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      class="main-panel"
      :limits="limits"
    >
      <template v-slot:before>
        <q-input
          ref="inputRef"
          v-model="mdText"
          type="textarea"
          autogrow
          :label="$t('markdownPage.editHere')"
          v-on:keydown.tab.prevent="onTabPressed"
        />
      </template>
      <template v-slot:after>
        <markdown-viewer
          v-model="mdText"
          class="q-ma-sm"
        />
      </template>
    </q-splitter>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { QInput, QSplitter } from 'quasar';
import MarkdownViewer from './MarkdownViewer.vue';

export type EditorType = 'edit' | 'view' | 'split';

const inputRef = ref<QInput>();

const splitterModel = ref(50);

const indentSize = ref(4);

const limits = ref<QSplitter['limits']>([0, Infinity]);

const props = withDefaults(defineProps<{
  modelValue: string,
  type: EditorType,
}>(), {});

type Emit = {
  (e: 'update:modelValue', value: string): void
}
const emit = defineEmits<Emit>();

const mdText = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

function onTabPressed() {
  const nativeInput = inputRef.value?.getNativeElement();
  if (nativeInput) {
    const indent = ' '.repeat(indentSize.value);
    document.execCommand('insertText', false, indent);
  }
}

watch(() => props.type, (newValue) => {
  if (newValue === 'edit') {
    splitterModel.value = 100;
  } else if (newValue === 'view') {
    splitterModel.value = 0;
  } else {
    splitterModel.value = 50;
  }
});
</script>

<style lang="sass" scoped>
.main-panel
  height: calc( 100vh - 150px )
</style>

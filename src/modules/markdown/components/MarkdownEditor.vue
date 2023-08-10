<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      class="main-panel"
      :limits="limits"
    >
      <template v-slot:before>
        <MonacoEditor
          v-model="mdText"
          class="main-panel"
        ></MonacoEditor>
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
import {
  computed, ref, watch,
} from 'vue';
import { QSplitter } from 'quasar';
import MonacoEditor from 'src/components/MonacoEditor.vue';
import MarkdownViewer from './MarkdownViewer.vue';

export type EditorType = 'edit' | 'view' | 'split';

const splitterModel = ref(50);

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

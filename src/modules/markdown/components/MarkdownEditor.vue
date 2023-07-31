<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      class="main-panel"
    >
      <template v-slot:before>
        <q-input
          ref="inputRef"
          v-model="mdText"
          type="textarea"
          autogrow
          class="left-panel"
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
import { computed, ref } from 'vue';
import { QInput } from 'quasar';
import MarkdownViewer from './MarkdownViewer.vue';

const inputRef = ref<QInput>();

const splitterModel = ref(50);

const indentSize = ref(4);

const props = defineProps<{
  modelValue: string,
}>();

type Emit = {
  (e: 'update:modelValue', value: string): void
}
const emit = defineEmits<Emit>();

const mdText = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

function onTabPressed(): void {
  const nativeInput = inputRef.value?.getNativeElement();
  if (nativeInput) {
    const start = nativeInput.selectionStart;
    const end = nativeInput.selectionEnd;
    if (start && end) {
      const indent = ' '.repeat(indentSize.value);
      const newValue = `${nativeInput.value.slice(0, start)}${indent}${nativeInput.value.slice(end)}`;
      nativeInput.value = newValue;
      nativeInput.selectionStart = start + indentSize.value;
      nativeInput.selectionEnd = start + indentSize.value;
    }
  }
}
</script>

<style lang="sass" scoped>
.main-panel
  height: calc( 100vh - 150px )
</style>

<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      :class="splitterClass"
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
import { computed, ref } from 'vue';
import { QInput } from 'quasar';
import MarkdownViewer from './MarkdownViewer.vue';

const inputRef = ref<QInput>();

const splitterModel = ref(50);

const indentSize = ref(4);

const props = withDefaults(defineProps<{
  modelValue: string,
  splitterClass?: string,
}>(), {
  splitterClass: 'main-panel',
});

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
</script>

<style lang="sass" scoped>
.main-panel
  height: calc( 100vh - 150px )
</style>

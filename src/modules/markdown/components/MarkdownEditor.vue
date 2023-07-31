<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      class="main-panel"
    >
      <template v-slot:before>
        <q-input
          v-model="mdText"
          type="textarea"
          autogrow
          class="left-panel"
          :label="$t('markdownPage.editHere')"
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
import MarkdownViewer from './MarkdownViewer.vue';

const splitterModel = ref(50);

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
</script>

<style lang="sass" scoped>
.main-panel
  height: calc( 100vh - 150px )
</style>

<template>
  <g
    class="prevent-select no-focus-ring"
    @click="addSelect"
  >
    <slot></slot>
  </g>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useDiagramStore } from '../stores/diagramStore';

const diagramStore = useDiagramStore();

const props = defineProps<{
  modelValue: boolean,
  id: string,
}>();

type Emit = {
  (e: 'update:modelValue', value: boolean): void
  (e: 'onSelect'): void
  (e: 'onUnselect'): void
}
const emit = defineEmits<Emit>();

const selectState = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const isSelected = computed(
  () => !!diagramStore.selectedIds.find((id) => id === props.id),
);

function addSelect() {
  diagramStore.selectedIds.length = 0;
  diagramStore.addSelectedId(props.id);
}

watch(isSelected, (newValue) => {
  if (selectState.value !== newValue) {
    selectState.value = newValue;
  }
  if (newValue) {
    emit('onSelect');
  } else {
    emit('onUnselect');
  }
});
</script>

<style lang="scss" scoped>
.no-focus-ring {
  outline: none;
}
</style>

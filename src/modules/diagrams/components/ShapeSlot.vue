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
  onSelect?:() => void,
  onUnselect?:() => void,
}>();

type Emit = {
  (e: 'update:modelValue', value: boolean): void
}
const emit = defineEmits<Emit>();

const isSelected = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

function addSelect() {
  diagramStore.addSelectedId(props.id);
}

watch(() => diagramStore.selectedIds.length, () => {
  const target = diagramStore.selectedIds.find((id) => id === props.id);
  isSelected.value = !!target;
  if (target && props.onSelect) {
    props.onSelect();
  } else if (!target && props.onUnselect) {
    props.onUnselect();
  }
});
</script>

<style lang="scss" scoped>
.no-focus-ring {
  outline: none;
}
</style>

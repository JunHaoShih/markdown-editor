<template>
  <template v-if="isSelected">
    <g v-touch-pan.prevent.mouse="diagramStore.handleDrag">
      <slot></slot>
    </g>
  </template>
  <template v-else>
    <g>
      <slot></slot>
    </g>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDiagramStore } from '../stores/diagramStore';

const diagramStore = useDiagramStore();

const props = defineProps<{
  id: string,
}>();

const isSelected = computed(
  () => !!diagramStore.selectedIds.find((selected) => selected.id === props.id),
);
</script>

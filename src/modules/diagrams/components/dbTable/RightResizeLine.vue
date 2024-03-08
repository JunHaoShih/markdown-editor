<template>
  <line
    :x1="x" :y1="y"
    :x2="x" :y2="y + height"
    :stroke="stroke"
    :stroke-width="strokeWidth"
  />
  <line
    :x1="x" :y1="y"
    :x2="x" :y2="y + height"
    stroke="transparent"
    stroke-width="10"
    v-touch-pan.mouse.horizontal="resizeRow"
    style="cursor: col-resize;"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: number,
  x: number,
  y: number,
  stroke: string,
  strokeWidth: string,
  height: number,
  minWidth: number,
}>();

type Emit = {
  (e: 'update:modelValue', value: number): void
}
const emit = defineEmits<Emit>();

const width = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

let initialRowWidth = 0;

function resizeRow(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  if (details.isFirst) {
    initialRowWidth = width.value;
  }
  if (details.offset?.x) {
    width.value = Math.max(initialRowWidth + details.offset.x, props.minWidth);
  }
}
</script>

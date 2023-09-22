<template>
  <path
    :d="selectedPath"
    :stroke="stroke"
    :stroke-width="strokeWidth"
    fill="transparent"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  margin: number,
  x: number,
  y: number,
  height: number,
  width: number,
  stroke: string,
  strokeWidth: string,
}>(), {
  margin: 0,
});

const selectedPath = computed(
  () => `M ${props.x - props.margin} ${props.y - props.margin} \
  H ${props.x + props.width + props.margin} \
  V ${props.y + props.height + props.margin} \
  H ${props.x - props.margin} V ${props.y - props.margin}`,
);
</script>

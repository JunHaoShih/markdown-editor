<template>
  <g>
    <path
      v-if="rightNodeId"
      fill="#29b6f2"
      :d="rightArrowPath"
    />
    <path
      v-if="leftNodeId"
      fill="#29b6f2"
      :d="leftArrowPath"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const offset = 20;

const arrowWidth = 20;

const arrowHeight = 16;

const props = defineProps<{
  x: number,
  y: number,
  width: number,
  height: number,
  leftNodeId?: string,
  rightNodeId?: string,
}>();

const centerY = computed(
  () => props.y + (props.height / 2),
);

const rightArrowX = computed(
  () => props.x + props.width + offset,
);

const rightArrowPath = computed(
  () => `M ${rightArrowX.value} ${centerY.value} \
  V ${centerY.value - (arrowHeight / 2)} \
  L ${rightArrowX.value + arrowWidth} ${centerY.value} \
  L ${rightArrowX.value} ${centerY.value + (arrowHeight / 2)} \
  V ${centerY.value}`,
);

const leftArrowX = computed(
  () => props.x - offset,
);

const leftArrowPath = computed(
  () => `M ${leftArrowX.value} ${centerY.value} \
  V ${centerY.value - (arrowHeight / 2)} \
  L ${leftArrowX.value - arrowWidth} ${centerY.value} \
  L ${leftArrowX.value} ${centerY.value + (arrowHeight / 2)} \
  V ${centerY.value}`,
);
</script>

<template>
  <line
    :x1="fromPoint.x"
    :y1="fromPoint.y"
    :x2="toPoint.x"
    :y2="toPoint.y"
    stroke-width="5"
    :stroke="isSelected ? 'rgb(10, 213, 240)' : 'transparent'"
  />
  <line
    :x1="fromPoint.x"
    :y1="fromPoint.y"
    :x2="toPoint.x"
    :y2="toPoint.y"
    style="stroke:rgb(0, 0, 0);stroke-width:1"
    :marker-start="line.arrowStart ? `url(#${line.arrowStart})` : ''"
    :marker-end="line.arrowEnd ? `url(#${line.arrowEnd})` : ''"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Shape } from '../../models/shape';

const props = defineProps<{
  line: Shape,
  isSelected: boolean,
}>();

const fromPoint = computed(
  () => props.line.position,
);

const toPoint = computed(
  () => props.line.toAbsolute ?? { x: 0, y: 0 },
);
</script>

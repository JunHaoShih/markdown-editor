<template>
  <line
    :x1="fromPoint.x"
    :y1="fromPoint.y"
    :x2="toPoint.x"
    :y2="toPoint.y"
    style="stroke:rgb(0, 0, 0);stroke-width:1"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Line } from '../../models/shape';
import { useDiagramStore } from '../../stores/diagramStore';

const diagramStore = useDiagramStore();

const props = defineProps<{
  modelValue: Line,
}>();

type Emit = {
  (e: 'update:modelValue', value: Line): void
}
const emit = defineEmits<Emit>();

const line = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const fromPoint = computed(
  () => {
    if (line.value.fromNode) {
      return diagramStore.connectionNode(line.value.fromNode);
    }
    if (line.value.fromAbsolute) {
      return line.value.fromAbsolute;
    }
    return { x: 0, y: 0 };
  },
);

const toPoint = computed(
  () => {
    if (line.value.toNode) {
      return diagramStore.connectionNode(line.value.toNode);
    }
    if (line.value.toAbsolute) {
      return line.value.toAbsolute;
    }
    return { x: 0, y: 0 };
  },
);
</script>

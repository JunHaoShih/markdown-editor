<template>
  <ShapeSlot
    v-model="isSelected"
    :id="line.id"
  >
    <line
      v-if="isSelected"
      :x1="fromPoint.x"
      :y1="fromPoint.y"
      :x2="toPoint.x"
      :y2="toPoint.y"
      style="stroke:rgb(10, 213, 240);stroke-width:3"
    />
    <line
      :x1="fromPoint.x"
      :y1="fromPoint.y"
      :x2="toPoint.x"
      :y2="toPoint.y"
      style="stroke:rgb(0, 0, 0);stroke-width:1"
    />
  </ShapeSlot>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ShapeSlot from '../ShapeSlot.vue';
import { Shape } from '../../models/shape';
import { useDiagramStore } from '../../stores/diagramStore';

const isSelected = ref(false);

const diagramStore = useDiagramStore();

const props = defineProps<{
  modelValue: Shape,
}>();

type Emit = {
  (e: 'update:modelValue', value: Shape): void
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
    return line.value.position;
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

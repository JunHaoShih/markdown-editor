<template>
  <ConnectionHintSvg
    :selected="isSelected"
    v-model="shape.connectionNodes"
    :x="shape.position.x"
    :y="shape.position.y"
    :width="shapeWidth"
    :height="shapeHeight"
    :shape-id="shape.id"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDiagramStore } from '../../stores/diagramStore';
import ConnectionHintSvg from '../ConnectionHintSvg.vue';
import { Shape } from '../../models/shape';

const diagramStore = useDiagramStore();

const props = defineProps<{
  modelValue: Shape,
}>();

type Emit = (e: 'update:modelValue', value: Shape) => void;

const emit = defineEmits<Emit>();

const shape = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const shapeWidth = computed(
  () => shape.value.width ?? 0,
);

const shapeHeight = computed(
  () => shape.value.height ?? 0,
);

const isSelected = computed(
  () => !!diagramStore.selectedIds.find((selected) => selected.id === shape.value.id),
);
</script>

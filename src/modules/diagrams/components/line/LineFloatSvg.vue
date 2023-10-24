<template>
  <circle
    v-if="isSelected"
    :cx="fromPoint.x"
    :cy="fromPoint.y"
    r="5"
    fill="#01bd22"
    @mousedown.stop="startConnectFrom"
  />
  <circle
    v-if="isSelected"
    :cx="toPoint.x"
    :cy="toPoint.y"
    r="5"
    fill="#01bd22"
    @mousedown.stop="startConnectTo"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Shape } from '../../models/shape';
import { useDiagramStore } from '../../stores/diagramStore';

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

const isSelected = computed(
  () => !!diagramStore.selectedIds.find((selected) => selected.id === line.value.id),
);

const fromPoint = computed(
  () => line.value.position,
);

const toPoint = computed(
  () => line.value.toAbsolute ?? { x: 0, y: 0 },
);

const fromNode = computed(
  () => (line.value.fromNode ? diagramStore.connectionNode(line.value.fromNode) : undefined),
);

const toNode = computed(
  () => (line.value.toNode ? diagramStore.connectionNode(line.value.toNode) : undefined),
);

function startConnectFrom() {
  diagramStore
    .startReconnectFrom('from', line.value.id, fromPoint.value, toPoint.value, fromNode.value?.id, toNode.value?.id);
}

function startConnectTo() {
  diagramStore
    .startReconnectFrom('to', line.value.id, fromPoint.value, toPoint.value, fromNode.value?.id, toNode.value?.id);
}
</script>

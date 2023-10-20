<template>
  <ShapeSlot
    v-model="isSelected"
    :id="line.id"
  >
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
    />
    <circle
      :cx="fromPoint.x"
      :cy="fromPoint.y"
      r="3"
      :fill="isSelected ? 'black' : 'transparent'"
      @mousedown.stop="startConnectFrom"
    />
    <circle
      :cx="toPoint.x"
      :cy="toPoint.y"
      r="3"
      :fill="isSelected ? 'black' : 'transparent'"
      @mousedown.stop="startConnectTo"
    />
  </ShapeSlot>
</template>

<script setup lang="ts">
import {
  computed, onBeforeMount, ref, watch,
} from 'vue';
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
  () => line.value.position,
);

const toPoint = computed(
  () => line.value.toAbsolute ?? { x: 0, y: 0 },
);

const fromNode = computed(
  () => (line.value.fromNode ? diagramStore.connectionNode(line.value.fromNode) : undefined),
);

watch(fromNode, (newValue) => {
  if (newValue) {
    line.value.position.x = newValue.point.x;
    line.value.position.y = newValue.point.y;
  } else {
    line.value.fromNode = '';
  }
}, {
  deep: true,
});

const toNode = computed(
  () => (line.value.toNode ? diagramStore.connectionNode(line.value.toNode) : undefined),
);

watch(toNode, (newValue) => {
  if (newValue) {
    line.value.toAbsolute = {
      x: newValue.point.x,
      y: newValue.point.y,
    };
  } else {
    line.value.toNode = '';
  }
}, {
  deep: true,
});

function startConnectFrom() {
  diagramStore
    .startReconnectFrom('from', line.value.id, fromPoint.value, toPoint.value, fromNode.value?.id, toNode.value?.id);
}

function startConnectTo() {
  diagramStore
    .startReconnectFrom('to', line.value.id, fromPoint.value, toPoint.value, fromNode.value?.id, toNode.value?.id);
}

onBeforeMount(() => {
  if (toNode.value) {
    line.value.toAbsolute = {
      x: toNode.value.point.x,
      y: toNode.value.point.y,
    };
  }
});
</script>

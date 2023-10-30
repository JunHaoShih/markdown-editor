<template>
  <ShapeSlot
    v-model="isSelected"
    :id="line.id"
  >
    <defs>
      <marker
        v-for="marker in markers"
        v-bind:key="marker.id"
        :id="marker.id"
        :viewBox="marker.viewBox"
        :refX="marker.refX"
        :refY="marker.refY"
        :markerWidth="marker.markerWidth"
        :markerHeight="marker.markerHeight"
        :orient="marker.orient"
      >
        <path
          :fill="marker.path.fill"
          :stroke="marker.path.stroke"
          :stroke-width="marker.path.strokeWidth"
          :d="marker.path.d"
        />
      </marker>
    </defs>
    <template v-if="lineInfo.type === 'straight'">
      <StraightLine
        :line="modelValue"
        :is-selected="isSelected"
      />
    </template>
    <template v-if="lineInfo.type === 'diagnal'">
      <DiagnalLine
        :line="modelValue"
        :is-selected="isSelected"
        :from-node="fromNode"
        :to-node="toNode"
      />
    </template>
  </ShapeSlot>
</template>

<script setup lang="ts">
import {
  computed, onBeforeMount, ref, watch,
} from 'vue';
import { markers } from './line';
import StraightLine from './StraightLine.vue';
import DiagnalLine from './DiagnalLine.vue';
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

const lineInfo = computed({
  get: () => line.value.lineInfo ?? {
    type: 'diagnal',
    startDistance: 30,
    endDistance: 30,
  },
  set: (value) => {
    line.value.lineInfo = value;
  },
});

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

onBeforeMount(() => {
  if (toNode.value) {
    line.value.toAbsolute = {
      x: toNode.value.point.x,
      y: toNode.value.point.y,
    };
  }
});
</script>

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
    <!--
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
    />-->
    <path
      :d="path"
      fill="none"
      stroke-width="5"
      :stroke="isSelected ? 'rgb(10, 213, 240)' : 'transparent'"
    />
    <path
      :d="path"
      style="stroke:rgb(0, 0, 0);stroke-width:1"
      fill="none"
      :marker-start="line.arrowStart ? `url(#${line.arrowStart})` : ''"
      :marker-end="line.arrowEnd ? `url(#${line.arrowEnd})` : ''"
    />
  </ShapeSlot>
</template>

<script setup lang="ts">
import {
  computed, onBeforeMount, ref, watch,
} from 'vue';
import { markers } from './line';
import ShapeSlot from '../ShapeSlot.vue';
import { Point, Shape } from '../../models/shape';
import { useDiagramStore } from '../../stores/diagramStore';

const startDistance = ref(30);

const endDistance = ref(30);

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

/**
 * Parse angle radian to degree
 * @param radians The radian you want to parse
 */
function toDegrees(radians: number) {
  return radians * (180 / Math.PI);
}

/**
 * Parse angle degree to radian
 * @param degrees The degree you want to parse
 */
function toRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

/**
 * Normalize 2d vector
 * @param vector The 2d vector you want to normalize
 */
function normalize2dVector(vector: number[]) {
  const magnitude = Math.sqrt((vector[0] * vector[0]) + (vector[1] * vector[1]));
  return vector.map((length) => length / magnitude);
}

/**
 * Rotate 2d vector with rotation matrix
 * @param vector target vector
 * @param radians rotate radians
 */
function rotate2dVector(vector: number[], radians: number) {
  const newVector: number[] = [];
  const x = vector[0] * Math.cos(radians) - vector[1] * Math.sin(radians);
  const y = vector[0] * Math.sin(radians) + vector[1] * Math.cos(radians);

  newVector.push(x, y);
  return newVector;
}

function findDegrees(from: Point, to: Point) {
  const dot = (from.x * to.x) + (from.y * to.y);
  const det = (from.x * to.y) - (from.y * to.x);
  const angle = Math.atan2(det, dot);
  const currentDegrees = toDegrees(angle);
  return Math.floor((currentDegrees + 45) / 90) * 90;
}

const startPoint = computed(
  (): Point => {
    const degrees = fromNode.value
      ? fromNode.value.orient
      : findDegrees({
        x: 0, y: -1,
      }, {
        x: toPoint.value.x - fromPoint.value.x,
        y: toPoint.value.y - fromPoint.value.y,
      });
    const rotatedVector = rotate2dVector([0, -startDistance.value], toRadians(degrees));
    return {
      x: fromPoint.value.x + rotatedVector[0],
      y: fromPoint.value.y + rotatedVector[1],
    };
  },
);

const endPoint = computed(
  (): Point => {
    const degrees = toNode.value
      ? toNode.value.orient
      : findDegrees({
        x: 0, y: -1,
      }, {
        x: fromPoint.value.x - toPoint.value.x,
        y: fromPoint.value.y - toPoint.value.y,
      });
    const rotatedVector = rotate2dVector([0, -endDistance.value], toRadians(degrees));
    return {
      x: toPoint.value.x + rotatedVector[0],
      y: toPoint.value.y + rotatedVector[1],
    };
  },
);

const path = computed(
  () => `M ${fromPoint.value.x} ${fromPoint.value.y} \
  L ${startPoint.value.x} ${startPoint.value.y} \
  L ${endPoint.value.x} ${endPoint.value.y} \
  L ${toPoint.value.x} ${toPoint.value.y}`,
);

onBeforeMount(() => {
  if (toNode.value) {
    line.value.toAbsolute = {
      x: toNode.value.point.x,
      y: toNode.value.point.y,
    };
  }
});
</script>

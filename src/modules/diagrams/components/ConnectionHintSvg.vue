<template>
  <g>
    <path
      v-for="node in nodes"
      v-bind:key="node.id"
      fill="#29b6f2"
      :d="getArrow(node)"
      :transform="getTransform(node)"
      @mousedown="setStartLocation(node)"
      v-touch-pan.prevent.mouse="handleDrag"
    />
    <line
      v-if="showLine"
      :x1="startLocation.x"
      :y1="startLocation.y"
      :x2="dragLocation.x"
      :y2="dragLocation.y"
      style="stroke:rgb(0, 0, 0);stroke-width:2" />
  </g>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ConnectionNode, Orient, Point } from '../models/shape';
import { useDiagramStore } from '../stores/diagramStore';

const offset = 20;

const arrowWidth = 20;

const arrowHeight = 16;

const diagramStore = useDiagramStore();

defineProps<{
  nodes: ConnectionNode[],
}>();

function getArrow(node: ConnectionNode) {
  return `M ${node.point.x} ${node.point.y} \
  V ${node.point.y - (arrowHeight / 2)} \
  L ${node.point.x + arrowWidth} ${node.point.y} \
  L ${node.point.x} ${node.point.y + (arrowHeight / 2)} \
  V ${node.point.y}`;
}

const angles: Record<Orient, string> = {
  left: '180',
  right: '0',
  bottom: '90',
  top: '270',
};

function getTransform(node: ConnectionNode) {
  return `rotate(${angles[node.orient]}, ${node.point.x}, ${node.point.y}) translate(${offset})`;
}

const showLine = ref(false);

const dragLocation = ref<Point>({
  x: 0,
  y: 0,
});

const startLocation = ref<Point>({
  x: 0,
  y: 0,
});

function handleDrag(details: {
  isFirst?: boolean,
  isFinal?: boolean,
  position?: {
    top?: number,
    left?: number,
  },
}) {
  const currentLocation: Point = {
    x: 0,
    y: 0,
  };
  if (details.position?.left) {
    currentLocation.x = details.position.left;
  }
  if (details.position?.top) {
    currentLocation.y = details.position.top;
  }

  dragLocation.value = diagramStore.pointShift(currentLocation);

  if (details.isFirst) {
    showLine.value = true;
  }
  if (details.isFinal) {
    showLine.value = false;
  }
}

function setStartLocation(node: ConnectionNode) {
  startLocation.value.x = node.point.x;
  startLocation.value.y = node.point.y;
}
</script>

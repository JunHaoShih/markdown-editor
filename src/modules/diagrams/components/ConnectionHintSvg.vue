<template>
  <g>
    <template
      v-for="node in nodes"
      v-bind:key="node.id"
    >
      <path
        :fill="selected ? '#29b6f2' : 'none'"
        :d="getArrow(node)"
        :transform="getTransform(node)"
        @mousedown="setStartLocation(node)"
      />
      <circle
        :cx="node.point.x"
        :cy="node.point.y"
        r="3"
        :fill="isNodeHover ? '#29b6f2' : 'transparent'"
        @mouseover="isNodeHover = true"
        @mouseout="isNodeHover = false"
        @mouseenter="setToNode(node)"
        @mouseleave="unsetToNode(node)"
      />
    </template>
  </g>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ConnectionNode, Orient, Point } from '../models/shape';
import { useDiagramStore } from '../stores/diagramStore';

const offset = 20;

const arrowWidth = 20;

const arrowHeight = 16;

const isNodeHover = ref(false);

const diagramStore = useDiagramStore();

defineProps<{
  nodes: ConnectionNode[],
  selected: boolean,
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

const startLocation = ref<Point>({
  x: 0,
  y: 0,
});

function setStartLocation(node: ConnectionNode) {
  startLocation.value.x = node.point.x;
  startLocation.value.y = node.point.y;
  diagramStore.startHolding('connect', node.point.x, node.point.y, node.id);
}

function setToNode(node: ConnectionNode) {
  if (diagramStore.holdType === 'connect') {
    diagramStore.setToNode(node.id);
  }
}

function unsetToNode(node: ConnectionNode) {
  if (diagramStore.holdType === 'connect') {
    diagramStore.unsetToNode(node.id);
  }
}
</script>

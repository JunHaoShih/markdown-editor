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
        @mousedown.stop="startConnect(node)"
      />
      <circle
        :cx="node.point.x"
        :cy="node.point.y"
        r="6"
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
import {
  computed, onBeforeMount, ref, watch,
} from 'vue';
import { ConnectionNode } from '../models/shape';
import { useDiagramStore } from '../stores/diagramStore';

const offset = 20;

const arrowWidth = 16;

const arrowHeight = 20;

const isNodeHover = ref(false);

const diagramStore = useDiagramStore();

const props = defineProps<{
  modelValue: ConnectionNode[],
  selected: boolean,
  x: number,
  y: number,
  width: number,
  height: number,
  shapeId: string,
}>();

type Emit = {
  (e: 'update:modelValue', value: ConnectionNode[]): void
}
const emit = defineEmits<Emit>();

const nodes = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

function getArrow(node: ConnectionNode) {
  return `M ${node.point.x} ${node.point.y} \
  H ${node.point.x - (arrowWidth / 2)} \
  L ${node.point.x} ${node.point.y - arrowHeight} \
  L ${node.point.x + (arrowWidth / 2)} ${node.point.y} \
  H ${node.point.x}`;
}

function getTransform(node: ConnectionNode) {
  return `rotate(${node.orient}, ${node.point.x}, ${node.point.y}) translate(0,${-offset})`;
}

function startConnect(node: ConnectionNode) {
  diagramStore.startConnect(node.point.x, node.point.y, node.id, props.shapeId);
}

function setToNode(node: ConnectionNode) {
  if (diagramStore.holdType === 'connect'
    || diagramStore.holdType === 'reconnect') {
    diagramStore.setConnectionNodeId(node.id, props.shapeId);
  }
}

function unsetToNode(node: ConnectionNode) {
  if (diagramStore.holdType === 'connect'
    || diagramStore.holdType === 'reconnect') {
    diagramStore.unsetConnectionNodeId(node.id);
  }
}

const relocateNodes: { (): void }[] = [
  () => {
    const node = nodes.value.find((cn) => cn.orient === 270);
    if (!node) {
      return;
    }
    node.point.x = props.x;
    node.point.y = props.y + (props.height / 2);
  },
  () => {
    const node = nodes.value.find((cn) => cn.orient === 90);
    if (!node) {
      return;
    }
    node.point.x = props.x + props.width;
    node.point.y = props.y + (props.height / 2);
  },
  () => {
    const node = nodes.value.find((cn) => cn.orient === 0);
    if (!node) {
      return;
    }
    node.point.x = props.x + (props.width / 2);
    node.point.y = props.y;
  },
  () => {
    const node = nodes.value.find((cn) => cn.orient === 180);
    if (!node) {
      return;
    }
    node.point.x = props.x + (props.width / 2);
    node.point.y = props.y + props.height;
  },
];

watch(() => [props.x, props.y, props.width, props.height], () => {
  relocateNodes.forEach((relocate) => relocate());
});

onBeforeMount(() => {
  relocateNodes.forEach((relocate) => relocate());
});
</script>

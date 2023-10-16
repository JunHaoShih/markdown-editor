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
import {
  computed, onBeforeMount, ref, watch,
} from 'vue';
import { ConnectionNode, Orient, Point } from '../models/shape';
import { useDiagramStore } from '../stores/diagramStore';

const offset = 20;

const arrowWidth = 20;

const arrowHeight = 16;

const isNodeHover = ref(false);

const diagramStore = useDiagramStore();

const props = defineProps<{
  modelValue: ConnectionNode[],
  selected: boolean,
  x: number,
  y: number,
  width: number,
  height: number,
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
  diagramStore.selectedIds.length = 0;
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

const relocateNodes: Record<Orient, () => void> = {
  left: () => {
    const node = nodes.value.find((cn) => cn.orient === 'left');
    if (!node) {
      return;
    }
    node.point.x = props.x;
    node.point.y = props.y + (props.height / 2);
  },
  right: () => {
    const node = nodes.value.find((cn) => cn.orient === 'right');
    if (!node) {
      return;
    }
    node.point.x = props.x + props.width;
    node.point.y = props.y + (props.height / 2);
  },
  top: () => {
    const node = nodes.value.find((cn) => cn.orient === 'top');
    if (!node) {
      return;
    }
    node.point.x = props.x + (props.width / 2);
    node.point.y = props.y;
  },
  bottom: () => {
    const node = nodes.value.find((cn) => cn.orient === 'bottom');
    if (!node) {
      return;
    }
    node.point.x = props.x + (props.width / 2);
    node.point.y = props.y + props.height;
  },
};

watch(() => [props.x, props.y, props.width], () => {
  nodes.value.forEach((node) => {
    relocateNodes[node.orient]();
  });
});

onBeforeMount(() => {
  relocateNodes.left();
  relocateNodes.right();
  relocateNodes.top();
  relocateNodes.bottom();
});
</script>

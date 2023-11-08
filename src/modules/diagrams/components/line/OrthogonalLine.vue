<template>
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
</template>

<script setup lang="ts">
import {
  computed, onBeforeMount, ref, watch,
} from 'vue';
import { ConnectionNode, Point, Shape } from '../../models/shape';
import { useDiagramStore } from '../../stores/diagramStore';
import { findOrthogonalPath } from './orthogonalPath';

const diagramStore = useDiagramStore();

const props = defineProps<{
  line: Shape,
  isSelected: boolean,
  fromNode?: ConnectionNode,
  toNode?: ConnectionNode,
}>();

const fromPoint = computed(
  () => props.line.position,
);

const toPoint = computed(
  () => props.line.toAbsolute ?? { x: 0, y: 0 },
);

/**
 * Parse angle radian to degree
 * @param radians The radian you want to parse
 */
function toDegrees(radians: number) {
  return radians * (180 / Math.PI);
}

function findDegrees(from: Point, to: Point) {
  const dot = (from.x * to.x) + (from.y * to.y);
  const det = (from.x * to.y) - (from.y * to.x);
  const angle = Math.atan2(det, dot);
  const currentDegrees = toDegrees(angle);
  return Math.floor((currentDegrees + 45) / 90) * 90;
}

const startDegrees = computed(
  () => {
    const degrees = props.fromNode
      ? props.fromNode.orient
      : findDegrees({
        x: 0, y: -1,
      }, {
        x: toPoint.value.x - fromPoint.value.x,
        y: toPoint.value.y - fromPoint.value.y,
      });
    return degrees;
  },
);

const endDegrees = computed(
  () => {
    const degrees = props.toNode
      ? props.toNode.orient
      : findDegrees({
        x: 0, y: -1,
      }, {
        x: fromPoint.value.x - toPoint.value.x,
        y: fromPoint.value.y - toPoint.value.y,
      });
    return degrees;
  },
);

const pathNodes = ref<Point[]>([]);

const path = computed(
  () => {
    if (pathNodes.value.length === 0) {
      return '';
    }
    const startPoint = pathNodes.value[0];
    const start = `M ${startPoint.x} ${startPoint.y}`;
    // const start = `M ${fromPoint.value.x} ${fromPoint.value.y}`;
    const endPoint = pathNodes.value[pathNodes.value.length - 1];
    const end = `L ${endPoint.x} ${endPoint.y}`;

    let midPath = '';
    for (let i = 1; i < pathNodes.value.length - 1; i += 1) {
      midPath += `L ${pathNodes.value[i].x} ${pathNodes.value[i].y} `;
    }
    return `${start} ${midPath} ${end}`;
  },
);

function findPath() {
  const from = diagramStore.diagram.shapes.find((shape) => shape.id === props.line.fromShapeId);
  if (!from) {
    return;
  }
  const to = diagramStore.diagram.shapes.find((shape) => shape.id === props.line.toShapeId);
  if (!to) {
    return;
  }

  const margin = 10;
  const boundaryX = Math.min(from.position.x, to.position.x);
  const boundaryY = Math.min(from.position.y, to.position.y);
  const boundaryX2 = Math.max(
    from.position.x + (from.width ?? 0),
    to.position.x + (to.width ?? 0),
  );
  const boundaryY2 = Math.max(
    from.position.y + (from.height ?? 0),
    to.position.y + (to.height ?? 0),
  );
  const boundary = {
    x: boundaryX - (5 * margin),
    y: boundaryY - (5 * margin),
    width: boundaryX2 - boundaryX + (20 * margin),
    height: boundaryY2 - boundaryY + (20 * margin),
  };

  const result2 = findOrthogonalPath({
    blocks: [
      {
        x: from.position.x,
        y: from.position.y,
        width: from.width ?? 0,
        height: from.height ?? 0,
      },
      {
        x: to.position.x,
        y: to.position.y,
        width: to.width ?? 0,
        height: to.height ?? 0,
      },
    ],
    fromPoint: {
      orient: props.fromNode?.orient ?? 0,
      point: fromPoint.value,
    },
    toPoint: {
      orient: props.toNode?.orient ?? 0,
      point: toPoint.value,
    },
    blockMargin: 10,
    globalBoundsMargin: 20,
    globalBounds: boundary,
  });

  const finalResult2 = result2.length > 0
    ? result2
    : findOrthogonalPath({
      blocks: [
        {
          x: from.position.x,
          y: from.position.y,
          width: 0,
          height: 0,
        },
        {
          x: to.position.x,
          y: to.position.y,
          width: 0,
          height: 0,
        },
      ],
      fromPoint: {
        orient: props.fromNode?.orient ?? 0,
        point: fromPoint.value,
      },
      toPoint: {
        orient: props.toNode?.orient ?? 0,
        point: toPoint.value,
      },
      blockMargin: 10,
      globalBoundsMargin: 20,
      globalBounds: boundary,
    });

  pathNodes.value.length = 0;
  finalResult2.forEach((pt) => {
    pathNodes.value.push({
      x: pt.x,
      y: pt.y,
    });
  });
}

watch(() => [
  props.line.position, props.line.toAbsolute, startDegrees.value, endDegrees.value,
], () => {
  findPath();
}, {
  deep: true,
});

onBeforeMount(() => {
  findPath();
});
</script>

<template>
  <path
    :d="path"
    fill="none"
    stroke-width="12"
    stroke="transparent"
  />
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
  computed, onBeforeMount, watch,
} from 'vue';
import { findOrthogonalPath } from 'src/services/pathFinding';
import {
  ConnectionNode, LineInfo, Point, Shape,
} from '../../models/shape';
import { useDiagramStore } from '../../stores/diagramStore';

const diagramStore = useDiagramStore();

const props = defineProps<{
  modelValue: Shape,
  isSelected: boolean,
  fromNode?: ConnectionNode,
  toNode?: ConnectionNode,
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
  get: (): LineInfo => line.value.lineInfo ?? {
    type: 'diagnal',
    startDistance: 30,
    endDistance: 30,
    paths: [],
  },
  set: (value) => {
    line.value.lineInfo = value;
  },
});

const fromPoint = computed(
  () => line.value.position,
);

const toPoint = computed(
  () => line.value.toAbsolute ?? { x: 0, y: 0 },
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

const path = computed(
  () => {
    if (lineInfo.value.paths.length === 0) {
      return '';
    }
    const startPoint = lineInfo.value.paths[0];
    const start = `M ${startPoint.x} ${startPoint.y}`;
    const endPoint = lineInfo.value.paths[lineInfo.value.paths.length - 1];
    const end = `L ${endPoint.x} ${endPoint.y}`;

    let midPath = '';
    for (let i = 1; i < lineInfo.value.paths.length - 1; i += 1) {
      midPath += `L ${lineInfo.value.paths[i].x} ${lineInfo.value.paths[i].y} `;
    }
    return `${start} ${midPath} ${end}`;
  },
);

function findPath() {
  const from = diagramStore.diagram.shapes.find((shape) => shape.id === line.value.fromShapeId);
  if (!from) {
    return;
  }
  const to = diagramStore.diagram.shapes.find((shape) => shape.id === line.value.toShapeId);
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

  lineInfo.value.paths.length = 0;
  finalResult2.forEach((pt) => {
    lineInfo.value.paths.push({
      x: pt.x,
      y: pt.y,
    });
  });
}

watch(() => [
  line.value.position, line.value.toAbsolute, startDegrees.value, endDegrees.value,
], () => {
  findPath();
}, {
  deep: true,
});

onBeforeMount(() => {
  if (lineInfo.value.paths.length === 0) {
    findPath();
  }
});
</script>

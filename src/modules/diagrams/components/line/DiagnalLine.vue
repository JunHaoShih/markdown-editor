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
import { computed } from 'vue';
import { ConnectionNode, Point, Shape } from '../../models/shape';

const props = defineProps<{
  line: Shape,
  isSelected: boolean,
  fromNode?: ConnectionNode,
  toNode?: ConnectionNode,
}>();

const lineInfo = computed(
  () => props.line.lineInfo ?? {
    type: 'diagnal',
    startDistance: 30,
    endDistance: 30,
  },
);

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

/**
 * Parse angle degree to radian
 * @param degrees The degree you want to parse
 */
function toRadians(degrees: number) {
  return degrees * (Math.PI / 180);
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
    const degrees = props.fromNode
      ? props.fromNode.orient
      : findDegrees({
        x: 0, y: -1,
      }, {
        x: toPoint.value.x - fromPoint.value.x,
        y: toPoint.value.y - fromPoint.value.y,
      });
    const rotatedVector = rotate2dVector(
      [0, -lineInfo.value.startDistance],
      toRadians(degrees),
    );
    return {
      x: fromPoint.value.x + rotatedVector[0],
      y: fromPoint.value.y + rotatedVector[1],
    };
  },
);

const endPoint = computed(
  (): Point => {
    const degrees = props.toNode
      ? props.toNode.orient
      : findDegrees({
        x: 0, y: -1,
      }, {
        x: fromPoint.value.x - toPoint.value.x,
        y: fromPoint.value.y - toPoint.value.y,
      });
    const rotatedVector = rotate2dVector(
      [0, -lineInfo.value.endDistance],
      toRadians(degrees),
    );
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
</script>

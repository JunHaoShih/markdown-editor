<template>
  <path
    :d="selectedPath"
    :stroke="stroke"
    :stroke-width="strokeWidth"
    fill="transparent"
  />
  <line
    :x1="topLeft.x" :y1="topLeft.y"
    :x2="bottomLeft.x" :y2="bottomLeft.y"
    stroke="transparent"
    stroke-width="10"
    v-touch-pan.mouse.horizontal="resizeLeft"
    style="cursor: col-resize;"
  />
  <line
    :x1="topRight.x" :y1="topRight.y"
    :x2="bottomRight.x" :y2="bottomRight.y"
    stroke="transparent"
    stroke-width="10"
    v-touch-pan.mouse.horizontal="resizeRight"
    style="cursor: col-resize;"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { Point } from '../Shape';

const props = withDefaults(defineProps<{
  margin: number,
  x: number,
  y: number,
  height: number,
  width: number,
  stroke: string,
  strokeWidth: string,
  resizable?: boolean,
}>(), {
  margin: 0,
  resizable: true,
});

type Emit = {
  (e: 'onResize', isFirst?: boolean, newPosition?: Point, newWidth?: number, newHeight?: number): void
}
const emit = defineEmits<Emit>();

const topLeft = computed(
  (): Point => ({
    x: props.x - props.margin,
    y: props.y - props.margin,
  }),
);

const bottomLeft = computed(
  (): Point => ({
    x: props.x - props.margin,
    y: props.y + props.height + props.margin,
  }),
);

const topRight = computed(
  (): Point => ({
    x: props.x + props.width + props.margin,
    y: props.y - props.margin,
  }),
);

const bottomRight = computed(
  (): Point => ({
    x: props.x + props.width + props.margin,
    y: props.y + props.height + props.margin,
  }),
);

const selectedPath = computed(
  () => `M ${props.x - props.margin} ${props.y - props.margin} \
  H ${props.x + props.width + props.margin} \
  V ${props.y + props.height + props.margin} \
  H ${props.x - props.margin} V ${props.y - props.margin}`,
);

const initialPosition: Point = {
  x: 0,
  y: 0,
};

let initialWidth = 0;

function resizeLeft(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  if (!props.resizable) {
    return;
  }
  if (details.isFirst) {
    initialPosition.x = props.x;
    initialPosition.y = props.y;
    initialWidth = props.width;
    emit('onResize', true);
  }
  if (details.offset && details.offset.x) {
    const newX = initialPosition.x + details.offset.x;
    const newWidth = initialWidth - details.offset.x;
    emit('onResize', false, {
      x: newX,
      y: initialPosition.y,
    }, newWidth, props.height);
  }
}

function resizeRight(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  if (!props.resizable) {
    return;
  }
  if (details.isFirst) {
    initialPosition.x = props.x;
    initialPosition.y = props.y;
    initialWidth = props.width;
    emit('onResize', true);
  }
  if (details.offset && details.offset.x) {
    const newWidth = initialWidth + details.offset.x;
    emit('onResize', false, {
      x: initialPosition.x,
      y: initialPosition.y,
    }, newWidth, props.height);
  }
}
</script>

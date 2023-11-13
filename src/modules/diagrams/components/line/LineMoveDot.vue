<template>
  <circle
    :cx="center.x"
    :cy="center.y"
    r="5"
    fill="red"
    :class="isHorizontal ? 'tw-cursor-ns-resize' : 'tw-cursor-ew-resize'"
    v-touch-pan.mouse="shiftLine"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Point } from '../../models/shape';

export interface MoveDotInfo {
  index: number,
  previous: Point,
  next: Point,
}

const props = defineProps<{
  info: MoveDotInfo,
}>();

type Emit = {
  (e: 'updateDots', value: MoveDotInfo): void
}
const emit = defineEmits<Emit>();

const moveDot = computed(
  () => props.info,
);

const center = computed(
  (): Point => ({
    x: (moveDot.value.previous.x + moveDot.value.next.x) / 2,
    y: (moveDot.value.previous.y + moveDot.value.next.y) / 2,
  }),
);

const isHorizontal = computed(
  () => moveDot.value.previous.y === moveDot.value.next.y,
);

const defaultPrevous = { x: 0, y: 0 };

const defaultNext = { x: 0, y: 0 };

function shiftLine(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  const newMoveDotInfo: MoveDotInfo = {
    index: moveDot.value.index,
    previous: {
      x: moveDot.value.previous.x,
      y: moveDot.value.previous.y,
    },
    next: {
      x: moveDot.value.next.x,
      y: moveDot.value.next.y,
    },
  };
  if (details.isFirst) {
    defaultPrevous.x = moveDot.value.previous.x;
    defaultPrevous.y = moveDot.value.previous.y;
    defaultNext.x = moveDot.value.next.x;
    defaultNext.y = moveDot.value.next.y;
  }
  if (!isHorizontal.value && details.offset?.x) {
    newMoveDotInfo.previous.x = defaultPrevous.x + details.offset.x;
    newMoveDotInfo.next.x = defaultNext.x + details.offset.x;
  }
  if (isHorizontal.value && details.offset?.y) {
    newMoveDotInfo.previous.y = defaultPrevous.y + details.offset.y;
    newMoveDotInfo.next.y = defaultNext.y + details.offset.y;
  }
  emit('updateDots', newMoveDotInfo);
}
</script>

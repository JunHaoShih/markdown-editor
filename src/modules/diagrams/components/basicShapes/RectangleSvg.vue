<template>
  <ShapeSlot
    v-model="isSelected"
    :id="shape.id"
  >
    <SelectedSvg
      v-if="isSelected"
      :margin="3"
      :width="shape.width"
      :height="shape.height"
      :x="shape.x"
      :y="shape.y"
      stroke="grey"
      stroke-width="1"
      @on-resize="onResize"
      :left-resizable="true"
      :right-resizable="true"
      :bottom-resizable="true"
      :top-resizable="true"
    />
    <g v-touch-pan.prevent.mouse="handleDrag">
      <path
        :d="path"
        stroke="black"
        stroke-width="1"
        fill="transparent"
      />
      <TextSvg
        v-model="shape.title"
        :x="shape.x"
        :y="shape.y"
        :width="shape.width"
        :height="shape.height"
        text-anchor="middle"
        vertical-align="center"
      />
    </g>
  </ShapeSlot>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import TextSvg from '../TextSvg.vue';
import SelectedSvg from '../SelectedSvg.vue';
import ShapeSlot from '../ShapeSlot.vue';
import { Point, Shape } from '../../models/shape';
import { rectConf } from '../../services/basicShapeService';

const isSelected = ref(false);

const props = defineProps<{
  modelValue: Shape,
}>();

type Emit = {
  (e: 'update:modelValue', value: Shape): void
}
const emit = defineEmits<Emit>();

const shape = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const path = computed(
  () => `M ${shape.value.x} ${shape.value.y} \
  h ${shape.value.width} \
  v ${shape.value.height} \
  h ${-shape.value.width} \
  v ${-shape.value.height}`,
);

const minWidth = computed({
  get: (): number => shape.value.minWidth ?? rectConf.minWidth,
  set: (value) => {
    shape.value.minWidth = value;
  },
});

const minHeight = computed({
  get: (): number => shape.value.minHeight ?? rectConf.minHeight,
  set: (value) => {
    shape.value.minHeight = value;
  },
});

let originalX = 0;

let originalY = 0;

let originalBottomY = 0;

let originalRightX = 0;

function onResize(isFirst?: boolean, newPosition?: Point, newWidth?: number, newHeight?: number) {
  if (isFirst) {
    originalX = shape.value.x;
    originalY = shape.value.y;
    originalRightX = shape.value.x + shape.value.width;
    originalBottomY = shape.value.y + shape.value.height;
    return;
  }

  if (!newPosition) {
    return;
  }

  if (newWidth) {
    shape.value.width = Math.max(newWidth, minWidth.value);
    if (shape.value.width > minWidth.value) {
      shape.value.x = newPosition.x;
    } else if (originalX === newPosition.x) {
      shape.value.x = originalX;
    } else {
      shape.value.x = originalRightX - shape.value.width;
    }
  }

  if (newHeight) {
    shape.value.height = Math.max(newHeight, minHeight.value);
    if (shape.value.height > minHeight.value) {
      shape.value.y = newPosition.y;
    } else if (originalY === newPosition.y) {
      shape.value.y = originalY;
    } else {
      shape.value.y = originalBottomY - shape.value.height;
    }
  }
}

function handleDrag(details: {
  delta?: {
    x?: number,
    y?: number,
  },
}) {
  if (details.delta?.x) {
    shape.value.x += details.delta.x;
  }
  if (details.delta?.y) {
    shape.value.y += details.delta.y;
  }
}
</script>

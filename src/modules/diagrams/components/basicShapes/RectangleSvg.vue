<template>
  <ShapeSlot
    v-model="isSelected"
    :id="shape.id"
  >
    <SelectedSvg
      v-if="isSelected"
      :margin="3"
      :width="shapeWidth"
      :height="shapeHeight"
      :x="shape.position.x"
      :y="shape.position.y"
      stroke="grey"
      stroke-width="1"
      @on-resize="onResize"
      :left-resizable="true"
      :right-resizable="true"
      :bottom-resizable="true"
      :top-resizable="true"
    />
    <DragSlot :id="shape.id">
      <path
        :d="path"
        stroke="black"
        stroke-width="1"
        fill="transparent"
      />
      <TextSvg
        v-model="shape.title"
        :x="shape.position.x"
        :y="shape.position.y"
        :width="shapeWidth"
        :height="shapeHeight"
        text-anchor="middle"
        vertical-align="center"
      />
    </DragSlot>
    <ConnectionHintSvg
      :selected="isSelected"
      v-model="shape.connectionNodes"
      :x="shape.position.x"
      :y="shape.position.y"
      :width="shapeWidth"
      :height="shapeHeight"
    />
  </ShapeSlot>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import TextSvg from '../TextSvg.vue';
import ConnectionHintSvg from '../ConnectionHintSvg.vue';
import DragSlot from '../DragSlot.vue';
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

const shapeWidth = computed(
  () => shape.value.width ?? 0,
);

const shapeHeight = computed(
  () => shape.value.height ?? 0,
);

const path = computed(
  () => `M ${shape.value.position.x} ${shape.value.position.y} \
  h ${shape.value.width} \
  v ${shape.value.height} \
  h ${-shapeWidth.value} \
  v ${-shapeHeight.value}`,
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
    originalX = shape.value.position.x;
    originalY = shape.value.position.y;
    originalRightX = shape.value.position.x + shapeWidth.value;
    originalBottomY = shape.value.position.y + shapeHeight.value;
    return;
  }

  if (!newPosition) {
    return;
  }

  if (newWidth) {
    shape.value.width = Math.max(newWidth, minWidth.value);
    if (shape.value.width > minWidth.value) {
      shape.value.position.x = newPosition.x;
    } else if (originalX === newPosition.x) {
      shape.value.position.x = originalX;
    } else {
      shape.value.position.x = originalRightX - shape.value.width;
    }
  }

  if (newHeight) {
    shape.value.height = Math.max(newHeight, minHeight.value);
    if (shape.value.height > minHeight.value) {
      shape.value.position.y = newPosition.y;
    } else if (originalY === newPosition.y) {
      shape.value.position.y = originalY;
    } else {
      shape.value.position.y = originalBottomY - shape.value.height;
    }
  }
}
</script>

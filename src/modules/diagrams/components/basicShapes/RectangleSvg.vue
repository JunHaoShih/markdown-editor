<template>
  <g
    class="prevent-select tw-outline-none"
    @click="isSelected = true"
    @blur="isSelected = false"
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
      />
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import TextSvg from '../TextSvg.vue';
import SelectedSvg from '../SelectedSvg.vue';
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

let originalRightX = 0;

function onResize(isFirst?: boolean, newPosition?: Point, newWidth?: number) {
  if (isFirst) {
    originalX = shape.value.x;
    originalRightX = shape.value.x + shape.value.width;
    return;
  }
  if (newWidth && newPosition) {
    shape.value.width = Math.max(newWidth, minWidth.value);
    if (shape.value.width > minWidth.value) {
      shape.value.x = newPosition.x;
    } else {
      shape.value.x = originalRightX - shape.value.width;
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

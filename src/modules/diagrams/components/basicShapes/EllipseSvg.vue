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
      <ellipse
        :cx="cx"
        :cy="cy"
        :rx="rx"
        :ry="ry"
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
  </ShapeSlot>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import TextSvg from '../TextSvg.vue';
import DragSlot from '../DragSlot.vue';
import SelectedSvg from '../SelectedSvg.vue';
import ShapeSlot from '../ShapeSlot.vue';
import { Shape } from '../../models/shape';
import { ellipseConf } from '../../services/basicShapeService';
import { useBasicSvgCalculation } from './basicSvgCalculation';

const isSelected = ref(false);

const props = defineProps<{
  modelValue: Shape,
}>();

type Emit = (e: 'update:modelValue', value: Shape) => void;

const emit = defineEmits<Emit>();

const {
  onResize, shapeWidth, shapeHeight, shape,
} = useBasicSvgCalculation({
  shape: () => props.modelValue,
  defaultMinWidth: () => ellipseConf.minWidth,
  defaultMinHeight: () => ellipseConf.minHeight,
  emit,
});

const cx = computed(
  () => shape.value.position.x + (shapeWidth.value / 2),
);

const cy = computed(
  () => shape.value.position.y + (shapeHeight.value / 2),
);

const rx = computed(
  () => shapeWidth.value / 2,
);

const ry = computed(
  () => shapeHeight.value / 2,
);
</script>
./basicSvgCalculation

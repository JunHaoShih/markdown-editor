<template>
  <g
    class="prevent-select no-focus-ring"
    v-touch-pan.prevent.mouse="handleDrag"
    @click="shape.isSelected = true"
    @blur="shape.isSelected = false"
  >
    <SelectedSvg
      v-if="shape.isSelected"
      :margin="2"
      :width="width"
      :height="height"
      :x="shape.position.x"
      :y="shape.position.y"
      stroke="red"
      stroke-width="2"
      @on-resize="onResize"
      :left-resizable="true"
      :right-resizable="true"
    />
    // title area
    <g
      @dblclick="displayTitle = true"
    >
      <path
        :d="titlePath"
        stroke="black"
        stroke-width="1"
        fill="transparent"
      />
      <text
        v-if="!displayTitle"
        :x="shape.position.x + (width / 2)"
        :y="shape.position.y + 20"
        font-weight="bold"
        text-anchor="middle"
      >
        {{ data.title }}
      </text>
      <foreignObject
      v-if="displayTitle"
        :x="shape.position.x"
        :y="shape.position.y"
        :width="width"
        :height="titleHeight"
        fill="transparent">
        <q-input
          v-model="data.title"
          autofocus
          dense
          filled
          type="text"
          @blur="displayTitle = false"
          v-on:keyup.prevent.enter="displayTitle = false"
        ></q-input>
      </foreignObject>
    </g>
    <g
      v-for="(col, index) in data.columns"
      v-bind:key="col.id"
    >
      <DbColumnSvg
        v-model="data.columns[index]"
        v-model:icon-width="data.iconWidth"
        v-model:name-width="data.nameWidth"
        v-model:type-width="data.typeWidth"
        v-model:label-width="data.labelWidth"
        :min-icon-width="data.minIconWidth"
        :min-name-width="data.minNameWidth"
        v-bind:min-type-width="data.minTypeWidth"
        :min-label-width="data.minLabelWidth"
        :x="shape.position.x"
        :y="getRowStartY(index)"
        :width="width"
      ></DbColumnSvg>
    </g>
    <g
      v-if="shape.isSelected"
    >
      <rect
        :x="shape.position.x + width + actionPanelOffset"
        :y="shape.position.y"
        width="24" height="24" rx="3"
        stroke="black"
        stroke-width="0.5"
        fill="transparent"
        @click="addNewRow"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        :x="shape.position.x + width + actionPanelOffset"
        :y="shape.position.y"
        height="24"
        viewBox="0 -960 960 960"
        width="24"
      >
        <path
          d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"
          fill="#29b6f2"
          @click="addNewRow"
        />
      </svg>
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Point, Shape } from '../../Shape';
import { DbTable, createDbTableColumn } from './DbTable';
import DbColumnSvg from './DbColumnSvg.vue';
import SelectedSvg from '../SelectedSvg.vue';

const displayTitle = ref(false);

const titleHeight = ref(30);

const actionPanelOffset = 15;

const props = defineProps<{
  modelValue: Shape,
  data: DbTable,
}>();

type Emit = {
  (e: 'update:modelValue', value: Shape): void
  (e: 'update:data', value: DbTable): void
}
const emit = defineEmits<Emit>();

const shape = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const data = computed({
  get: () => props.data,
  set: (value) => emit('update:data', value),
});

const width = computed(
  () => data.value.iconWidth
    + data.value.nameWidth
    + data.value.typeWidth
    + data.value.labelWidth,
);

const height = computed(
  () => titleHeight.value
    + data.value.columns
      .map((col) => col.height)
      .reduce((accumulator, current) => accumulator + current, 0),
);

function handleDrag(details: {
  delta?: {
    x?: number,
    y?: number,
  },
}) {
  if (details.delta?.x) {
    shape.value.position.x += details.delta.x;
  }
  if (details.delta?.y) {
    shape.value.position.y += details.delta.y;
  }
}

const titlePath = computed(
  () => `M ${shape.value.position.x} ${shape.value.position.y} \
  H ${shape.value.position.x + width.value} \
  V ${shape.value.position.y + titleHeight.value} \
  H ${shape.value.position.x} V ${shape.value.position.y}`,
);

function getRowStartY(index: number) {
  return shape.value.position.y
    + titleHeight.value
    + data.value.columns
      .map((col) => col.height)
      .reduce((accumulator, current, currentIndex) => {
        if (currentIndex >= index) {
          return accumulator;
        }
        return accumulator + current;
      }, 0);
}

let originalX = 0;

function onResize(isFirst?: boolean, newPosition?: Point, newWidth?: number) {
  if (isFirst) {
    originalX = shape.value.position.x;
    return;
  }
  if (newWidth && newPosition) {
    data.value.nameWidth = Math.max(
      data.value.nameWidth + newWidth - width.value,
      data.value.minNameWidth,
    );
    if (data.value.nameWidth > data.value.minNameWidth) {
      shape.value.position.x = newPosition.x;
    } else {
      shape.value.position.x = originalX;
    }
  }
}

function addNewRow() {
  data.value.columns.push(createDbTableColumn());
}
</script>

<style lang="scss" scoped>
.no-focus-ring {
  outline: none;
}
</style>

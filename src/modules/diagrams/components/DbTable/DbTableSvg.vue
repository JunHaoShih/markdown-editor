<template>
  <g
    class="prevent-select no-focus-ring"
    @click="shape.isSelected = true"
    @blur="unselectAll"
  >
    <SelectedSvg
      v-if="shape.isSelected"
      :margin="5"
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
    <g
      v-touch-pan.prevent.mouse="handleDrag"
    >
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
      <DbColumnList
        ref="dbColumnSvgs"
        v-model="data"
        :x="shape.position.x"
        :y="shape.position.y + titleHeight"
        v-model:selected-ids="selectedIds"
      ></DbColumnList>
    </g>
    // Action panel
    <g
      v-if="shape.isSelected"
    >
      <g
        @click="addNewRow"
        :transform="`translate(${actionPanelX}, ${shape.position.y})`"
      >
        <rect
          :width="actionBtnSideLength" :height="actionBtnSideLength" :rx="actionBtnRx"
          stroke="black"
          stroke-width="0.5"
          fill="transparent"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          :height="actionBtnSideLength"
          viewBox="0 -960 960 960"
          :width="actionBtnSideLength"
        >
          <path
            d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"
            fill="#29b6f2"
          />
        </svg>
      </g>
      <g
        v-if="selectedIds.length > 0"
        :transform="`translate(${actionPanelX}, ${removeBtnY})`"
        @click="deleteRow"
      >
        <rect
          :width="actionBtnSideLength" :height="actionBtnSideLength" :rx="actionBtnRx"
          stroke="black"
          stroke-width="0.5"
          fill="transparent"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          :height="actionBtnSideLength"
          viewBox="0 -960 960 960"
          :width="actionBtnSideLength"
        >
          <path
            d="M200-440v-80h560v80H200Z"
            fill="red"
          />
        </svg>
      </g>
    </g>
  </g>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Point, Shape } from '../../Shape';
import { DbTable, createDbTableColumn } from './DbTable';
import SelectedSvg from '../SelectedSvg.vue';
import DbColumnList from './DbColumnListSvg.vue';

const $q = useQuasar();

const i18n = useI18n();

const dbColumnSvgs = ref<InstanceType<typeof DbColumnList>>();

const displayTitle = ref(false);

const titleHeight = ref(30);

const actionPanelOffset = 25;

const actionBtnSideLength = 24;

const actionBtnRx = 3;

const actionBtnOffset = 5;

const selectedIds = ref<string[]>([]);

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

/**
 * Path of erd table grid
 */
const titlePath = computed(
  () => `M ${shape.value.position.x} ${shape.value.position.y} \
  H ${shape.value.position.x + width.value} \
  V ${shape.value.position.y + titleHeight.value} \
  H ${shape.value.position.x} V ${shape.value.position.y}`,
);

/**
 * Starting point(x) of action panel
 */
const actionPanelX = computed(
  () => shape.value.position.x + width.value + actionPanelOffset,
);

const removeBtnY = computed(
  () => shape.value.position.y + actionBtnSideLength + actionBtnOffset,
);

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

function unselectAll() {
  shape.value.isSelected = false;
  dbColumnSvgs.value?.unselectAll();
}

function deleteRow() {
  if (selectedIds.value.length <= 0) {
    return;
  }
  let firstIndex = -1;

  // Delete rows
  selectedIds.value.forEach((colId) => {
    const index = data.value.columns.findIndex((col) => col.id === colId);
    if (index === -1) {
      $q.notify({
        type: 'error',
        message: i18n.t('unknownError'),
      });
      return;
    }
    // Get first index
    if (firstIndex === -1) {
      firstIndex = index;
    }
    data.value.columns.splice(index, 1);
  });
  // Clear selected ids
  selectedIds.value.length = 0;

  if (firstIndex === -1 || data.value.columns.length === 0) {
    return;
  }
  if (firstIndex >= data.value.columns.length) {
    selectedIds.value.push(data.value.columns[data.value.columns.length - 1].id);
  } else {
    selectedIds.value.push(data.value.columns[firstIndex].id);
  }
}
</script>

<style lang="scss" scoped>
.no-focus-ring {
  outline: none;
}
</style>

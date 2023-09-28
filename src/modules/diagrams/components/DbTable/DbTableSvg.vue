<template>
  <g
    class="prevent-select no-focus-ring"
    @click="isSelected = true"
    @blur="unselectAll"
  >
    <SelectedSvg
      v-if="isSelected"
      :margin="5"
      :width="width"
      :height="height"
      :x="shape.position.x"
      :y="shape.position.y"
      stroke="grey"
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
      <line
        :x1="shape.position.x" :y1="shape.position.y + height"
        :x2="shape.position.x + width" :y2="shape.position.y + height"
        stroke="black"
        stroke-width="1"
      />
    </g>
    // Action panel
    <g
      v-if="isSelected"
    >
      <ActionBtnSvgVue
        v-for="(btnInfo, index) in actionBtns"
        v-bind:key="btnInfo.name"
        :x="actionPanelX"
        :y="getActionBtnY(index)"
        :rx="actionBtnRx"
        :width="actionBtnSideLength"
        :height="actionBtnSideLength"
        :path="btnInfo.path"
        :fill="btnInfo.fill"
        @click="btnInfo.onClick"
      ></ActionBtnSvgVue>
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
import ActionBtnSvgVue from '../ActionBtnSvg.vue';

const isSelected = ref(false);

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

function getActionBtnY(index: number) {
  return shape.value.position.y + index * (actionBtnSideLength + actionBtnOffset);
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

function unselectAll() {
  isSelected.value = false;
  dbColumnSvgs.value?.unselectAll();
}

/**
 * Delete rows and select adjacent row
 */
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
  // select adjacent row
  if (firstIndex >= data.value.columns.length) {
    selectedIds.value.push(data.value.columns[data.value.columns.length - 1].id);
  } else {
    selectedIds.value.push(data.value.columns[firstIndex].id);
  }
}

function addNewFrontRow() {
  if (selectedIds.value.length <= 0) {
    return;
  }
  const index = data.value.columns.findIndex((col) => col.id === selectedIds.value[0]);
  if (index === -1) {
    return;
  }
  data.value.columns.splice(index, 0, createDbTableColumn());
}

function addNewEndRow() {
  if (selectedIds.value.length <= 0) {
    return;
  }
  const index = data.value.columns.findIndex((col) => col.id === selectedIds.value[0]);
  if (index === -1) {
    return;
  }
  data.value.columns.splice(index + 1, 0, createDbTableColumn());
}

function moveUp() {
  const index = data.value.columns.findIndex((col) => col.id === selectedIds.value[0]);
  if (index < 1) {
    return;
  }
  const temp = data.value.columns[index];
  data.value.columns[index] = data.value.columns[index - 1];
  data.value.columns[index - 1] = temp;
}

function moveDown() {
  const index = data.value.columns.findIndex((col) => col.id === selectedIds.value[0]);
  if (index >= data.value.columns.length - 1) {
    return;
  }
  const temp = data.value.columns[index];
  data.value.columns[index] = data.value.columns[index + 1];
  data.value.columns[index + 1] = temp;
}

interface BtnInfo {
  name: string,
  path: string,
  fill: string,
  display: boolean,
  onClick: (() => void),
}

const actionBtns = computed(
  (): BtnInfo[] => {
    const infos: BtnInfo[] = [
      {
        name: 'Add',
        path: 'M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z',
        fill: '#29b6f2',
        display: true,
        onClick: addNewRow,
      },
      {
        name: 'Remove',
        path: 'M200-440v-80h560v80H200Z',
        fill: 'red',
        display: selectedIds.value.length > 0,
        onClick: deleteRow,
      },
      {
        name: 'Insert front',
        path: 'M744-160 280-624v264h-80v-400h400v80H336l464 464-56 56Z',
        fill: '#29b6f2',
        display: selectedIds.value.length > 0,
        onClick: addNewFrontRow,
      },
      {
        name: 'Insert end',
        path: 'M200-200v-400h80v264l464-464 56 56-464 464h264v80H200Z',
        fill: '#29b6f2',
        display: selectedIds.value.length > 0,
        onClick: addNewEndRow,
      },
      {
        name: 'Move up',
        path: 'M440-80v-647L256-544l-56-56 280-280 280 280-56 57-184-184v647h-80Z',
        fill: 'black',
        display: selectedIds.value.length === 1
          && data.value.columns.findIndex((col) => col.id === selectedIds.value[0]) !== 0,
        onClick: moveUp,
      },
      {
        name: 'Move down',
        path: 'M480-80 200-360l56-56 184 183v-647h80v647l184-184 56 57L480-80Z',
        fill: 'black',
        display: selectedIds.value.length === 1
          && data.value.columns.findIndex(
            (col) => col.id === selectedIds.value[0],
          ) < data.value.columns.length - 1,
        onClick: moveDown,
      },
    ];
    return infos.filter((btnInfo) => btnInfo.display);
  },
);
</script>

<style lang="scss" scoped>
.no-focus-ring {
  outline: none;
}
</style>

<template>
  <ShapeSlot
    v-model="isSelected"
    :id="shape.id"
    :on-unselect="unselectAll"
  >
    <SelectedSvg
      v-if="isSelected"
      :margin="3"
      :width="width"
      :height="height"
      :x="shape.x"
      :y="shape.y"
      stroke="grey"
      stroke-width="1"
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
          :x="shape.x + (width / 2)"
          :y="shape.y + 20"
          font-weight="bold"
          text-anchor="middle"
        >
          {{ shape.title }}
        </text>
        <foreignObject
          v-if="displayTitle"
          :x="shape.x"
          :y="shape.y"
          :width="width"
          :height="titleHeight"
          fill="transparent">
          <q-input
            v-model="shape.title"
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
        v-for="(col, index) in columns"
        v-bind:key="col.id"
      >
        <DbColumnSvg
          v-model="columns[index]"
          v-model:icon-width="iconWidth"
          v-model:name-width="nameWidth"
          v-model:type-width="typeWidth"
          v-model:label-width="labelWidth"
          :min-icon-width="minIconWidth"
          :min-name-width="minNameWidth"
          :min-type-width="minTypeWidth"
          :min-label-width="minLabelWidth"
          :x="shape.x"
          :y="getRowStartY(index)"
          :width="width"
          :selected-ids="selectedIds"
          @on-selected="onSelectedChange"
        ></DbColumnSvg>
      </g>
      <line
        :x1="shape.x" :y1="shape.y + height"
        :x2="shape.x + width" :y2="shape.y + height"
        stroke="black"
        stroke-width="1"
      />
    </g>
    // Action panel
    <g
      v-if="isSelected"
    >
      <ActionBtnSvg
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
      ></ActionBtnSvg>
    </g>
    <template
      v-for="(col, index) in columns"
      v-bind:key="col.id"
    >
      <ConnectionHintSvg
        :selected="!!selectedIds.find((colId) => colId === col.id)"
        v-model="columns[index].connectionNodes"
        :x="shape.x"
        :y="getRowStartY(index)"
        :width="width"
        :height="col.height"
      />
    </template>
  </ShapeSlot>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DbColumnSvg from './DbColumnSvg.vue';
import ConnectionHintSvg from '../ConnectionHintSvg.vue';
import SelectedSvg from '../SelectedSvg.vue';
import ShapeSlot from '../ShapeSlot.vue';
import ActionBtnSvg from '../ActionBtnSvg.vue';
import { Point, Shape } from '../../models/shape';
import { createDbTableColumn, dbTableConf } from '../../services/dbTableService';

const isSelected = ref(false);

const $q = useQuasar();

const i18n = useI18n();

const displayTitle = ref(false);

const titleHeight = ref(30);

const actionPanelOffset = 45;

const actionBtnSideLength = 24;

const actionBtnRx = 3;

const actionBtnOffset = 5;

const selectedIds = ref<string[]>([]);

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

const columns = computed({
  get: () => shape.value.dbColumns ?? [],
  set: (value) => {
    shape.value.dbColumns = value;
  },
});

const iconWidth = computed({
  get: (): number => shape.value.extraSizeInfos.icon.width ?? dbTableConf.minIconWidth,
  set: (value) => {
    shape.value.extraSizeInfos.icon.width = value;
  },
});

const minIconWidth = computed({
  get: (): number => shape.value.extraSizeInfos.icon.minWidth ?? dbTableConf.minIconWidth,
  set: (value) => {
    shape.value.extraSizeInfos.icon.minWidth = value;
  },
});

const nameWidth = computed({
  get: (): number => shape.value.extraSizeInfos.name.width ?? dbTableConf.minNameWidth,
  set: (value) => {
    shape.value.extraSizeInfos.name.width = value;
  },
});

const minNameWidth = computed({
  get: (): number => shape.value.extraSizeInfos.name.minWidth ?? dbTableConf.minNameWidth,
  set: (value) => {
    shape.value.extraSizeInfos.name.minWidth = value;
  },
});

const typeWidth = computed({
  get: (): number => shape.value.extraSizeInfos.type.width ?? dbTableConf.minTypeWidth,
  set: (value) => {
    shape.value.extraSizeInfos.type.width = value;
  },
});

const minTypeWidth = computed({
  get: (): number => shape.value.extraSizeInfos.type.minWidth ?? dbTableConf.minTypeWidth,
  set: (value) => {
    shape.value.extraSizeInfos.type.minWidth = value;
  },
});

const labelWidth = computed({
  get: (): number => shape.value.extraSizeInfos.label.width ?? dbTableConf.minLabelWidth,
  set: (value) => {
    shape.value.extraSizeInfos.label.width = value;
  },
});

const minLabelWidth = computed({
  get: (): number => shape.value.extraSizeInfos.label.minWidth ?? dbTableConf.minLabelWidth,
  set: (value) => {
    shape.value.extraSizeInfos.label.minWidth = value;
  },
});

const width = computed(
  () => iconWidth.value
    + nameWidth.value
    + typeWidth.value
    + labelWidth.value,
);

function getRowStartY(index: number) {
  return shape.value.y
    + titleHeight.value
    + columns.value
      .map((col) => col.height)
      .reduce((accumulator, current, currentIndex) => {
        if (currentIndex >= index) {
          return accumulator;
        }
        return accumulator + current;
      }, 0);
}

const height = computed(
  () => titleHeight.value + columns.value
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
    shape.value.x += details.delta.x;
  }
  if (details.delta?.y) {
    shape.value.y += details.delta.y;
  }
}

/**
 * Path of erd table grid
 */
const titlePath = computed(
  () => `M ${shape.value.x} ${shape.value.y} \
  H ${shape.value.x + width.value} \
  V ${shape.value.y + titleHeight.value} \
  H ${shape.value.x} V ${shape.value.y}`,
);

/**
 * Starting point(x) of action panel
 */
const actionPanelX = computed(
  () => shape.value.x + width.value + actionPanelOffset,
);

function getActionBtnY(index: number) {
  return shape.value.y + index * (actionBtnSideLength + actionBtnOffset);
}

let originalX = 0;

function onResize(isFirst?: boolean, newPosition?: Point, newWidth?: number) {
  if (isFirst) {
    originalX = shape.value.x;
    return;
  }
  if (newWidth && newPosition) {
    nameWidth.value = Math.max(
      nameWidth.value + newWidth - width.value,
      minNameWidth.value,
    );
    if (nameWidth.value > minNameWidth.value) {
      shape.value.x = newPosition.x;
    } else {
      shape.value.x = originalX;
    }
  }
}

function addNewRow() {
  if (!shape.value.dbColumns) {
    shape.value.dbColumns = [];
  }
  shape.value.dbColumns.push(createDbTableColumn());
}

function onSelectedChange(id: string) {
  selectedIds.value.length = 0;
  if (!selectedIds.value.find((colId) => colId === id)) {
    selectedIds.value.push(id);
  }
}

function unselectAll() {
  selectedIds.value.length = 0;
}

/**
 * Delete rows and select adjacent row
 */
function deleteRow() {
  if (!shape.value.dbColumns) {
    shape.value.dbColumns = [];
    return;
  }
  if (selectedIds.value.length <= 0) {
    return;
  }
  let firstIndex = -1;

  // Delete rows
  // eslint-disable-next-line no-restricted-syntax
  for (const colId of selectedIds.value) {
    const index = shape.value.dbColumns.findIndex((col) => col.id === colId);
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
    shape.value.dbColumns.splice(index, 1);
  }

  // Clear selected ids
  selectedIds.value.length = 0;

  if (firstIndex === -1 || shape.value.dbColumns.length === 0) {
    return;
  }
  // select adjacent row
  if (firstIndex >= shape.value.dbColumns.length) {
    selectedIds.value.push(shape.value.dbColumns[shape.value.dbColumns.length - 1].id);
  } else {
    selectedIds.value.push(shape.value.dbColumns[firstIndex].id);
  }
}

function addNewFrontRow() {
  if (!shape.value.dbColumns) {
    shape.value.dbColumns = [];
  }
  if (selectedIds.value.length <= 0) {
    return;
  }
  const index = shape.value.dbColumns.findIndex((col) => col.id === selectedIds.value[0]);
  if (index === -1) {
    return;
  }
  shape.value.dbColumns.splice(index, 0, createDbTableColumn());
}

function addNewEndRow() {
  if (!shape.value.dbColumns) {
    shape.value.dbColumns = [];
  }
  if (selectedIds.value.length <= 0) {
    return;
  }
  const index = shape.value.dbColumns.findIndex((col) => col.id === selectedIds.value[0]);
  if (index === -1) {
    return;
  }
  shape.value.dbColumns.splice(index + 1, 0, createDbTableColumn());
}

function moveUp() {
  if (!shape.value.dbColumns) {
    return;
  }
  const index = shape.value.dbColumns.findIndex((col) => col.id === selectedIds.value[0]);
  if (index < 1) {
    return;
  }
  const temp = shape.value.dbColumns[index];
  shape.value.dbColumns[index] = shape.value.dbColumns[index - 1];
  shape.value.dbColumns[index - 1] = temp;
}

function moveDown() {
  if (!shape.value.dbColumns) {
    return;
  }
  const index = shape.value.dbColumns.findIndex((col) => col.id === selectedIds.value[0]);
  if (index >= shape.value.dbColumns.length - 1) {
    return;
  }
  const temp = shape.value.dbColumns[index];
  shape.value.dbColumns[index] = shape.value.dbColumns[index + 1];
  shape.value.dbColumns[index + 1] = temp;
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
    const currentIndex = shape.value.dbColumns
      ? shape.value.dbColumns.findIndex((col) => col.id === selectedIds.value[0])
      : -1;
    const currentLength = shape.value.dbColumns
      ? shape.value.dbColumns.length
      : 0;
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
          && currentIndex > 0,
        onClick: moveUp,
      },
      {
        name: 'Move down',
        path: 'M480-80 200-360l56-56 184 183v-647h80v647l184-184 56 57L480-80Z',
        fill: 'black',
        display: selectedIds.value.length === 1
          && currentIndex < currentLength - 1,
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

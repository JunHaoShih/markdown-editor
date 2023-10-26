<template>
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
      :selected="!!selectedIds.find((id) => id === col.id)"
      v-model="columns[index].connectionNodes"
      :x="shape.position.x"
      :y="getRowStartY(index)"
      :width="width"
      :height="col.height"
    />
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import ActionBtnSvg from '../ActionBtnSvg.vue';
import ConnectionHintSvg from '../ConnectionHintSvg.vue';
import { Shape } from '../../models/shape';
import { useDiagramStore } from '../../stores/diagramStore';
import { createDbTableColumn } from '../../services/dbTableService';

const $q = useQuasar();

const i18n = useI18n();

const actionPanelOffset = 45;

const actionBtnSideLength = 24;

const actionBtnRx = 3;

const actionBtnOffset = 5;

const titleHeight = ref(30);

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

const diagramStore = useDiagramStore();

const isSelected = computed(
  () => !!diagramStore.selectedIds.find((selected) => selected.id === shape.value.id),
);

const selectedIds = computed(
  () => diagramStore.selectedIds
    .find((selected) => selected.id === shape.value.id)
    ?.children
    .map((child) => child.id) ?? [],
);

const columns = computed({
  get: () => shape.value.dbColumns ?? [],
  set: (value) => {
    shape.value.dbColumns = value;
  },
});

const width = computed(
  () => shape.value.width ?? 0,
);

function getRowStartY(index: number) {
  return shape.value.position.y
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

/**
 * Starting point(x) of action panel
 */
const actionPanelX = computed(
  () => shape.value.position.x + width.value + actionPanelOffset,
);

function getActionBtnY(index: number) {
  return shape.value.position.y + index * (actionBtnSideLength + actionBtnOffset);
}

function addNewRow() {
  if (!shape.value.dbColumns) {
    shape.value.dbColumns = [];
  }
  shape.value.dbColumns.push(createDbTableColumn());
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
  for (const selectedId of selectedIds.value) {
    const index = shape.value.dbColumns.findIndex((col) => col.id === selectedId);
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

  if (firstIndex === -1 || shape.value.dbColumns.length === 0) {
    return;
  }
  const index = diagramStore.selectedIds.findIndex((selected) => selected.id === shape.value.id);
  const target = diagramStore.selectedIds[index];
  target.children.length = 0;
  // select adjacent row
  if (firstIndex >= shape.value.dbColumns.length) {
    // selectedIds.value.push(shape.value.dbColumns[shape.value.dbColumns.length - 1].id);
    target.children.push({
      id: shape.value.dbColumns[shape.value.dbColumns.length - 1].id,
      children: [],
    });
  } else {
    // selectedIds.value.push(shape.value.dbColumns[firstIndex].id);
    target.children.push({
      id: shape.value.dbColumns[firstIndex].id,
      children: [],
    });
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

<template>
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
      :x="x"
      :y="getRowStartY(index)"
      :width="width"
      :selected-ids="selectedIds"
      @on-selected="onSelectedChange"
    ></DbColumnSvg>
  </g>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, watch } from 'vue';
import DbColumnSvg from './DbColumnSvg.vue';
import { Point, Shape } from '../../models/shape';

const defaultIconWidth = 30;

const defaultNameWidth = 90;

const defaultTypeWidth = 50;

const defaultLabelWidth = 30;

const props = defineProps<{
  modelValue: Shape,
  selectedIds: string[],
  x: number,
  y: number,
}>();

type Emit = {
  (e: 'update:modelValue', value: Shape): void
  (e: 'update:selectedIds', value: string[]): void
  (e: 'onWidthChanged', value: number): void
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

const selectedIdsComp = computed({
  get: () => props.selectedIds,
  set: (value) => emit('update:selectedIds', value),
});

const iconWidth = computed({
  get: (): number => shape.value.extraSizeInfos.icon.width ?? defaultIconWidth,
  set: (value) => {
    shape.value.extraSizeInfos.icon.width = value;
  },
});

const minIconWidth = computed({
  get: (): number => shape.value.extraSizeInfos.icon.minWidth ?? defaultIconWidth,
  set: (value) => {
    shape.value.extraSizeInfos.icon.minWidth = value;
  },
});

const nameWidth = computed({
  get: (): number => shape.value.extraSizeInfos.name.width ?? defaultNameWidth,
  set: (value) => {
    shape.value.extraSizeInfos.name.width = value;
  },
});

const minNameWidth = computed({
  get: (): number => shape.value.extraSizeInfos.name.minWidth ?? defaultNameWidth,
  set: (value) => {
    shape.value.extraSizeInfos.name.minWidth = value;
  },
});

const typeWidth = computed({
  get: (): number => shape.value.extraSizeInfos.type.width ?? defaultTypeWidth,
  set: (value) => {
    shape.value.extraSizeInfos.type.width = value;
  },
});

const minTypeWidth = computed({
  get: (): number => shape.value.extraSizeInfos.type.minWidth ?? defaultTypeWidth,
  set: (value) => {
    shape.value.extraSizeInfos.type.minWidth = value;
  },
});

const labelWidth = computed({
  get: (): number => shape.value.extraSizeInfos.label.width ?? defaultLabelWidth,
  set: (value) => {
    shape.value.extraSizeInfos.label.width = value;
  },
});

const minLabelWidth = computed({
  get: (): number => shape.value.extraSizeInfos.label.minWidth ?? defaultLabelWidth,
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
  return props.y
    + columns.value
      .map((col) => col.height)
      .reduce((accumulator, current, currentIndex) => {
        if (currentIndex >= index) {
          return accumulator;
        }
        return accumulator + current;
      }, 0);
}

function onSelectedChange(id: string) {
  selectedIdsComp.value.length = 0;
  if (!selectedIdsComp.value.find((colId) => colId === id)) {
    selectedIdsComp.value.push(id);
  }
}

function unselectAll() {
  selectedIdsComp.value.length = 0;
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

watch(width, (newValue) => {
  emit('onWidthChanged', newValue);
});

defineExpose({
  unselectAll,
  onResize,
});

onBeforeMount(() => {
  emit('onWidthChanged', width.value);
});
</script>

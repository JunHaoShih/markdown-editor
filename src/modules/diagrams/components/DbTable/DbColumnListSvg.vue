<template>
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
      :x="x"
      :y="getRowStartY(index)"
      :width="width"
      :selected-ids="selectedIds"
      @on-selected="onSelectedChange"
    ></DbColumnSvg>
  </g>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { DbTable } from './DbTable';
import DbColumnSvg from './DbColumnSvg.vue';

const props = defineProps<{
  modelValue: DbTable,
  selectedIds: string[],
  x: number,
  y: number,
}>();

type Emit = {
  (e: 'update:modelValue', value: DbTable): void
  (e: 'update:selectedIds', value: string[]): void
}
const emit = defineEmits<Emit>();

const data = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const selectedIdsComp = computed({
  get: () => props.selectedIds,
  set: (value) => emit('update:selectedIds', value),
});

const width = computed(
  () => data.value.iconWidth
    + data.value.nameWidth
    + data.value.typeWidth
    + data.value.labelWidth,
);

function getRowStartY(index: number) {
  return props.y
    + data.value.columns
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

defineExpose({
  unselectAll,
});
</script>

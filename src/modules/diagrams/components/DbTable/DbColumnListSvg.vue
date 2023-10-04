<template>
  <g
    v-for="(col, index) in controller.getColumns()"
    v-bind:key="col.id"
  >
    <DbColumnSvg
      :controller="controller.findColumn(col.id)"
      :width="width"
      v-model:icon-width="data.iconWidth"
      v-model:name-width="data.nameWidth"
      v-model:type-width="data.typeWidth"
      v-model:label-width="data.labelWidth"
      :min-icon-width="data.minIconWidth"
      :min-name-width="data.minNameWidth"
      v-bind:min-type-width="data.minTypeWidth"
      :selected-ids="selectedIds"
      @on-selected="onSelectedChange"
    ></DbColumnSvg>
  </g>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import DbColumnSvg from './DbColumnSvg.vue';
import { DbTableController } from '../../services/diagramService';

const props = defineProps<{
  controller: DbTableController,
  selectedIds: string[],
  x: number,
  y: number,
}>();

type Emit = {
  (e: 'update:selectedIds', value: string[]): void
}
const emit = defineEmits<Emit>();

const selectedIdsComp = computed({
  get: () => props.selectedIds,
  set: (value) => emit('update:selectedIds', value),
});

const width = computed(
  () => props.controller.getIconWidth()
    + props.controller.getNameWidth()
    + props.controller.getTypeWidth()
    + props.controller.getLabelWidth(),
);

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

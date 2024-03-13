<template>
  <ShapeSlot
    v-model="isSelected"
    :id="shape.id"
    @on-unselect="unselectAll"
    @on-select="addSelectedChildren"
  >
    <SelectedSvg
      v-if="isSelected"
      :margin="3"
      :width="width"
      :height="height"
      :x="shape.position.x"
      :y="shape.position.y"
      stroke="grey"
      stroke-width="1"
      @on-resize="onResize"
      :left-resizable="true"
      :right-resizable="true"
    />
    <DragSlot :id="shape.id">

      // title area
      <TextSvg
        v-model="shape.title"
        :x="shape.position.x"
        :y="shape.position.y"
        :width="width"
        :height="titleHeight"
        text-anchor="middle"
        stroke="black"
        stroke-width="1"
      />
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
          :x="shape.position.x"
          :y="getRowStartY(index)"
          :width="width"
          :selected-ids="selectedIds"
          @on-selected="onSelectedChange"
        ></DbColumnSvg>
      </g>
      <line
        :x1="shape.position.x" :y1="shape.position.y + height"
        :x2="shape.position.x + width" :y2="shape.position.y + height"
        stroke="black"
        stroke-width="1"
      />
    </DragSlot>
    // Action panel
  </ShapeSlot>
</template>

<script setup lang="ts">
import {
  computed, onBeforeMount, ref, watch,
} from 'vue';
import DbColumnSvg from './DbColumnSvg.vue';
import TextSvg from '../TextSvg.vue';
import DragSlot from '../DragSlot.vue';
import SelectedSvg from '../SelectedSvg.vue';
import ShapeSlot from '../ShapeSlot.vue';
import { Point, Shape } from '../../models/shape';
import { dbTableConf } from '../../services/dbTableService';
import { useDiagramStore } from '../../stores/diagramStore';

const isSelected = ref(false);

const titleHeight = ref(30);

const props = defineProps<{
  modelValue: Shape,
}>();

type Emit = (e: 'update:modelValue', value: Shape) => void;

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

const height = computed(
  () => titleHeight.value + columns.value
    .map((col) => col.height)
    .reduce((accumulator, current) => accumulator + current, 0),
);

let originalX = 0;

function onResize(isFirst?: boolean, newPosition?: Point, newWidth?: number) {
  if (isFirst) {
    originalX = shape.value.position.x;
    return;
  }
  if (newWidth && newPosition) {
    nameWidth.value = Math.max(
      nameWidth.value + newWidth - width.value,
      minNameWidth.value,
    );
    if (nameWidth.value > minNameWidth.value) {
      shape.value.position.x = newPosition.x;
    } else {
      shape.value.position.x = originalX;
    }
  }
}

const diagramStore = useDiagramStore();

const selectedIds = computed(
  () => diagramStore.selectedIds
    .find((selected) => selected.id === shape.value.id)
    ?.children
    .map((child) => child.id) ?? [],
);

/**
 * This is used when column select is triggered but shaped is not yet added to selectedIds
 */
let buffer = '';

function onSelectedChange(id: string) {
  const index = diagramStore.selectedIds.findIndex((selected) => selected.id === shape.value.id);
  if (index === -1) {
    // Add id to buffer, then addSelectedChildren will add id to selected list
    buffer = id;
    return;
  }
  const target = diagramStore.selectedIds[index];

  const { length } = target.children;
  target.children.push({
    id,
    children: [],
  });
  target.children.splice(0, length);
}

function unselectAll() {
  // Not used
}

function addSelectedChildren() {
  if (buffer) {
    const index = diagramStore.selectedIds.findIndex((selected) => selected.id === shape.value.id);
    const target = diagramStore.selectedIds[index];
    target.children.push({
      id: buffer,
      children: [],
    });
    buffer = '';
  }
}

watch(() => [width.value, height.value], () => {
  shape.value.width = width.value;
  shape.value.height = height.value;
});

onBeforeMount(() => {
  shape.value.width = width.value;
  shape.value.height = height.value;
});
</script>

<style lang="scss" scoped>
.no-focus-ring {
  outline: none;
}
</style>

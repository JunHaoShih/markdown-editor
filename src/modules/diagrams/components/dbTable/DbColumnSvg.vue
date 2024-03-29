<template>
  <g
    @click="onSelected"
  >
    <SelectedSvg
      v-if="isSelected"
      :margin="-3"
      :width="width"
      :height="modelValue.height"
      :x="x"
      :y="y"
      stroke="#29b6f2"
      stroke-width="1"
      :left-resizable="false"
      :right-resizable="false"
    />
    // primary key
    <BooleanSvg
      v-model="dbColumn.isPrimary"
      :x="x + 2"
      :y="y + 3"
      :height="dbColumn.height"
      :width="iconWidth"
    >
      <template v-slot:display="props">
        <svg
          v-if="props.isTrue"
          :x="x + 2"
          :y="y + 3"
          height="20"
          viewBox="0 -960 960 960"
          width="20"
        >
          // key svg icon
          <path
            d="M280-400q-33 0-56.5-23.5T200-480q0-33 23.5-56.5T280-560q33 0 56.5 23.5T360-480q0
            33-23.5 56.5T280-400Zm0 160q-100 0-170-70T40-480q0-100 70-170t170-70q67 0 121.5
            33t86.5 87h352l120 120-180 180-80-60-80 60-85-60h-47q-32 54-86.5 87T280-240Zm0-80q56 0
            98.5-34t56.5-86h125l58 41 82-61 71 55 75-75-40-40H435q-14-52-56.5-86T280-640q-66 0-113
            47t-47 113q0 66 47 113t113 47Z"
            fill="coral"
          />
        </svg>
      </template>
    </BooleanSvg>
    // bottom line
    <path
      :d="getRowBottomPath()"
      stroke="black"
      stroke-width="1"
      fill="transparent"
      stroke-dasharray="5,5"
    />
    // Table name
    <TextSvg
      v-model="dbColumn.name"
      :x="getNameX()"
      :y="y"
      :width="nameWidth"
      :height="dbColumn.height"
    />
    // Type name
    <TextSvg
      v-model="dbColumn.type"
      :x="getTypeX()"
      :y="y"
      :width="typeWidth"
      :height="dbColumn.height"
    />
    // label name
    <TextSvg
      v-model="dbColumn.uniqueKeys"
      :x="getLabelX()"
      :y="y"
      :width="labelWidth"
      :height="dbColumn.height"
    />
    // Left line
    <line
      :x1="x" :y1="y"
      :x2="x" :y2="y + dbColumn.height"
      stroke="black"
      stroke-width="1"
    />
    // Icon column resize line
    <RightResizeLine
      v-model="iconWidthComp"
      :x="getNameX()"
      :y="y"
      stroke="black"
      strokeWidth="1"
      :height="modelValue.height"
      :minWidth="minIconWidth"
    />
    // Name column resize line
    <RightResizeLine
      v-model="nameWidthComp"
      :x="getTypeX()"
      :y="y"
      stroke="black"
      strokeWidth="1"
      :height="modelValue.height"
      :minWidth="minNameWidth"
    />
    // Type column resize line
    <RightResizeLine
      v-model="typeWidthComp"
      :x="getLabelX()"
      :y="y"
      stroke="black"
      strokeWidth="1"
      :height="modelValue.height"
      :minWidth="minTypeWidth"
    />
    // Label column resize line
    <RightResizeLine
      v-model="labelWidthComp"
      :x="getRightX()"
      :y="y"
      stroke="black"
      strokeWidth="1"
      :height="modelValue.height"
      :minWidth="minLabelWidth"
    />
  </g>
</template>
<script setup lang="ts">
import {
  computed, onBeforeMount, watch,
} from 'vue';
import RightResizeLine from './RightResizeLine.vue';
import TextSvg from '../TextSvg.vue';
import BooleanSvg from '../BooleanSvg.vue';
import SelectedSvg from '../SelectedSvg.vue';
import { DbTableColumn } from '../../models/dbTableColumn';

const props = defineProps<{
  modelValue: DbTableColumn,
  iconWidth: number,
  minIconWidth: number,
  nameWidth: number,
  minNameWidth: number,
  typeWidth: number,
  minTypeWidth: number,
  labelWidth: number,
  minLabelWidth: number,
  x: number,
  y: number,
  width: number,
  selectedIds: string[],
}>();

type Emit = {
  (e: 'update:modelValue', value: DbTableColumn): void
  (e: 'update:iconWidth', value: number): void
  (e: 'update:nameWidth', value: number): void
  (e: 'update:typeWidth', value: number): void
  (e: 'update:labelWidth', value: number): void
  (e: 'update:isSelected', value: boolean): void
  (e: 'onSelected', id: string): void
}
const emit = defineEmits<Emit>();

const dbColumn = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const iconWidthComp = computed({
  get: () => props.iconWidth,
  set: (value) => emit('update:iconWidth', value),
});

const nameWidthComp = computed({
  get: () => props.nameWidth,
  set: (value) => emit('update:nameWidth', value),
});

const typeWidthComp = computed({
  get: () => props.typeWidth,
  set: (value) => emit('update:typeWidth', value),
});

const labelWidthComp = computed({
  get: () => props.labelWidth,
  set: (value) => emit('update:labelWidth', value),
});

const isSelected = computed(
  (): boolean => !!props.selectedIds.find((id) => id === props.modelValue.id),
);

function getNameX() {
  return props.x + iconWidthComp.value;
}

function getTypeX() {
  return getNameX() + nameWidthComp.value;
}

function getLabelX() {
  return getTypeX() + typeWidthComp.value;
}

function getRightX() {
  return getLabelX() + labelWidthComp.value;
}

function getRowBottomPath() {
  const startX = props.x;
  const startY = props.y + dbColumn.value.height;
  return `M ${startX} ${startY} H ${startX + props.width}`;
}

const relocateNodes: (() => void)[] = [
  () => {
    const node = dbColumn.value.connectionNodes.find((cn) => cn.orient === 270);
    if (!node) {
      return;
    }
    node.point.x = props.x;
    node.point.y = props.y + (dbColumn.value.height / 2);
  },
  () => {
    const node = dbColumn.value.connectionNodes.find((cn) => cn.orient === 90);
    if (!node) {
      return;
    }
    node.point.x = props.x + props.width;
    node.point.y = props.y + (dbColumn.value.height / 2);
  },
  () => {
    const node = dbColumn.value.connectionNodes.find((cn) => cn.orient === 0);
    if (!node) {
      return;
    }
    node.point.x = props.x + (props.width / 2);
    node.point.y = props.y;
  },
  () => {
    const node = dbColumn.value.connectionNodes.find((cn) => cn.orient === 180);
    if (!node) {
      return;
    }
    node.point.x = props.x + (props.width / 2);
    node.point.y = props.y + dbColumn.value.height;
  },
];

watch(() => [props.x, props.y, props.width], () => {
  relocateNodes.forEach((relocate) => relocate());
});

function onSelected() {
  emit('onSelected', dbColumn.value.id);
}

onBeforeMount(() => {
  relocateNodes.forEach((relocate) => relocate());
});
</script>

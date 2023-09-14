<template>
  <g
    v-touch-pan.prevent.mouse="handleDrag"
  >
    <circle
      :cx="point.x" :cy="point.y" r="40" stroke="green" stroke-width="2" fill="yellow"
    />
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
        :x="point.x + (width / 2)"
        :y="point.y + 20"
        font-weight="bold"
        text-anchor="middle"
      >
        {{ title }}
      </text>
    </g>
    <foreignObject
      v-if="displayTitle"
      :x="point.x"
      :y="point.y"
      :width="width"
      :height="height"
      fill="transparent">
      <q-input
        v-model="title"
        autofocus
        dense
        type="text"
        @blur="displayTitle = false"
        v-on:keyup.prevent.enter="displayTitle = false"
      ></q-input>
    </foreignObject>
    <g
      v-for="(row, index) in rows"
      v-bind:key="row.name"
      @dblclick="row.isEditing = true"
    >
      <path
        :d="getRowPath(index)"
        stroke="black"
        stroke-width="1"
        fill="transparent"
      />
      <text
        v-if="!row.isEditing"
        :x="point.x + 5"
        :y="getRowStartY(index) + 20"
      >
        {{ row.name }} ({{ row.type }})
      </text>
      <foreignObject
        v-if="row.isEditing"
        :x="point.x"
        :y="getRowStartY(index)"
        :width="width"
        :height="height"
        fill="transparent">
        <q-input
          v-model="row.name"
          autofocus
          dense
          type="text"
          @blur="row.isEditing = false"
          v-on:keyup.prevent.enter="row.isEditing = false"
        ></q-input>
      </foreignObject>
    </g>
  </g>
</template>

<script setup lang="ts">
import {
  computed, onBeforeMount, ref,
} from 'vue';

export interface Point {
  x: number,
  y: number,
}

const point = ref<Point>({
  x: 0,
  y: 0,
});

const title = ref('');

const displayTitle = ref(false);

const height = ref(30);

const width = ref(200);

const titlePath = computed(
  () => `M ${point.value.x} ${point.value.y} H ${point.value.x + width.value} V ${point.value.y + height.value} \
  H ${point.value.x} V ${point.value.y}`,
);

const props = defineProps<{
  x: number,
  y: number,
  name: string,
}>();

function handleDrag(details: {
  delta?: {
    x?: number,
    y?: number,
  },
}) {
  if (details.delta?.x) {
    point.value.x += details.delta.x;
  }
  if (details.delta?.y) {
    point.value.y += details.delta.y;
  }
}

interface TableRow {
  name: string,
  isPrimary: boolean,
  type: string,
  uniqueKeys: string[],
  isEditing?: boolean,
}

const rows = ref<TableRow[]>([
  {
    name: 'asd',
    isPrimary: true,
    type: 'int',
    uniqueKeys: [],
  },
  {
    name: 'fff',
    isPrimary: true,
    type: 'int',
    uniqueKeys: [],
  },
]);

function getRowStartY(index: number) {
  return point.value.y + (height.value * (index + 1));
}

function getRowPath(index: number) {
  const startX = point.value.x;
  const startY = getRowStartY(index);
  return `M ${startX} ${startY} V ${startY + height.value} H ${startX + width.value} \
  V ${startY}`;
}

onBeforeMount(() => {
  point.value.x = props.x;
  point.value.y = props.y;
  title.value = props.name;
});
</script>

<style lang="scss" scoped>
</style>

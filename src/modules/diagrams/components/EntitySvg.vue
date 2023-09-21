<!-- eslint-disable max-len -->
<template>
  <g
    class="prevent-select"
    v-touch-pan.prevent.mouse="handleDrag"
  >
    // drag area
    <path
      :d="dragPath"
      stroke="transparent"
      stroke-width="1"
      fill="transparent"
    />
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
        filled
        type="text"
        @blur="displayTitle = false"
        v-on:keyup.prevent.enter="displayTitle = false"
      ></q-input>
    </foreignObject>
    // rows area
    <g
      v-for="(row, index) in rows"
      v-bind:key="row.name"
      @dblclick="row.isEditing = true"
    >
      // primary key
      <svg
        v-if="row.isPrimary"
        :x="point.x"
        :y="getRowStartY(index) - 26"
        height="20"
        viewBox="0 -960 960 960"
        width="20"
      >
        // key svg icon
        <path
          d="M280-400q-33 0-56.5-23.5T200-480q0-33 23.5-56.5T280-560q33 0 56.5 23.5T360-480q0 33-23.5 56.5T280-400Zm0 160q-100 0-170-70T40-480q0-100 70-170t170-70q67 0 121.5 33t86.5 87h352l120 120-180 180-80-60-80 60-85-60h-47q-32 54-86.5 87T280-240Zm0-80q56 0 98.5-34t56.5-86h125l58 41 82-61 71 55 75-75-40-40H435q-14-52-56.5-86T280-640q-66 0-113 47t-47 113q0 66 47 113t113 47Z"
          fill="coral"
        />
      </svg>
      <path
        :d="getRowBottomPath(index)"
        stroke="black"
        stroke-width="1"
        fill="transparent"
      />
      <text
        :x="getNameX() + 10"
        :y="getRowStartY(index) - 10"
        text-anchor="left"
      >
        {{ row.name }}
      </text>
      <text
        :x="getTypeX() + 10"
        :y="getRowStartY(index) - 10"
        text-anchor="left"
      >
        {{ row.type }}
      </text>
      <line :x1="point.x" :y1="getRowStartY(index - 1)"
        :x2="point.x" :y2="getRowStartY(rows.length - 1)"
        stroke="black"
        stroke-width="1"
      />
      <line :x1="getNameX()" :y1="getRowStartY(index - 1)"
        :x2="getNameX()" :y2="getRowStartY(rows.length - 1)"
        stroke="black"
        stroke-width="1"
      />
      <line :x1="getNameX()" :y1="getRowStartY(index - 1)"
        :x2="getNameX()" :y2="getRowStartY(rows.length - 1)"
        stroke="black"
        stroke-width="1"
      />
      <line :x1="getNameX()" :y1="getRowStartY(index - 1)"
        :x2="getNameX()" :y2="getRowStartY(rows.length - 1)"
        stroke="transparent"
        stroke-width="10"
        v-touch-pan.mouse.horizontal="resizeIconRow"
        style="cursor: col-resize;"
      />
      <line :x1="getTypeX()" :y1="getRowStartY(index - 1)"
        :x2="getTypeX()" :y2="getRowStartY(rows.length - 1)"
        stroke="black"
        stroke-width="1"
      />
      <line :x1="getTypeX()" :y1="getRowStartY(index - 1)"
        :x2="getTypeX()" :y2="getRowStartY(rows.length - 1)"
        stroke="transparent"
        stroke-width="10"
        v-touch-pan.mouse.horizontal="resizeNameRow"
        style="cursor: col-resize;"
      />
      <line :x1="getLabelX()" :y1="getRowStartY(index - 1)"
        :x2="getLabelX()" :y2="getRowStartY(rows.length - 1)"
        stroke="black"
        stroke-width="1"
      />
      <line :x1="getLabelX()" :y1="getRowStartY(index - 1)"
        :x2="getLabelX()" :y2="getRowStartY(rows.length - 1)"
        stroke="transparent"
        stroke-width="10"
        v-touch-pan.mouse.horizontal="resizeTypeRow"
        style="cursor: col-resize;"
      />
      <line :x1="point.x + width" :y1="getRowStartY(index - 1)"
        :x2="point.x + width" :y2="getRowStartY(rows.length - 1)"
        stroke="black"
        stroke-width="1"
      />
      <line :x1="point.x + width" :y1="getRowStartY(index - 1)"
        :x2="point.x + width" :y2="getRowStartY(rows.length - 1)"
        stroke="transparent"
        stroke-width="10"
        v-touch-pan.mouse.horizontal="resizeAllRow"
        style="cursor: col-resize;"
      />
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

const height = ref(30);

function getRowStartY(index: number) {
  return point.value.y + (height.value * (index + 2));
}

const minIconWidth = 30;

const iconWidth = ref(minIconWidth);

const minNameWidth = 90;

const nameWidth = ref(90);

function getNameX() {
  return point.value.x + iconWidth.value;
}

const minTypeWidth = 50;

const typeWidth = ref(minTypeWidth);

function getTypeX() {
  return getNameX() + nameWidth.value;
}

const minLabelWidth = 30;

const labelWidth = ref(minLabelWidth);

function getLabelX() {
  return getTypeX() + typeWidth.value;
}

const title = ref('');

const displayTitle = ref(false);

const width = computed(
  () => iconWidth.value + nameWidth.value + typeWidth.value + labelWidth.value,
);

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
    isPrimary: false,
    type: 'int',
    uniqueKeys: [],
  },
  {
    name: 'ggg',
    isPrimary: false,
    type: 'int',
    uniqueKeys: [],
  },
]);

function getRowBottomPath(index: number) {
  const startX = point.value.x;
  const startY = getRowStartY(index);
  return `M ${startX} ${startY} H ${startX + width.value} \
  V ${startY}`;
}

const dragPath = computed(
  () => {
    const currentHeight = (rows.value.length + 1) * height.value;
    return `M ${point.value.x} ${point.value.y} H ${point.value.x + width.value} V ${point.value.y + currentHeight} \
    H ${point.value.x} V ${point.value.y}`;
  },
);

let initialIconRowWidth = 0;

function resizeIconRow(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  if (details.isFirst) {
    initialIconRowWidth = iconWidth.value;
  }
  if (details.offset && details.offset.x) {
    iconWidth.value = Math.max(initialIconRowWidth + details.offset.x, minIconWidth);
  }
}

let initialNameColWidth = 0;

function resizeNameRow(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  if (details.isFirst) {
    initialNameColWidth = nameWidth.value;
  }
  if (details.offset && details.offset.x) {
    nameWidth.value = Math.max(initialNameColWidth + details.offset.x, minNameWidth);
  }
}

let initialTypeColWidth = 0;

function resizeTypeRow(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  if (details.isFirst) {
    initialTypeColWidth = typeWidth.value;
  }
  if (details.offset && details.offset.x) {
    typeWidth.value = Math.max(initialTypeColWidth + details.offset.x, minTypeWidth);
  }
}

let initialLabelColWidth = 0;

function resizeAllRow(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  if (details.isFirst) {
    initialLabelColWidth = labelWidth.value;
  }
  if (details.offset && details.offset.x) {
    labelWidth.value = Math.max(initialLabelColWidth + details.offset.x, minLabelWidth);
  }
}

onBeforeMount(() => {
  point.value.x = props.x;
  point.value.y = props.y;
  title.value = props.name;
});
</script>

<style lang="scss" scoped>
</style>

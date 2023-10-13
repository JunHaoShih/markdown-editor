<template>
  // title area
  <g
    @dblclick="isEdit = true"
  >
    <path
      :d="clickPath"
      stroke="transparent"
      stroke-width="1"
      fill="transparent"
    />
    <text
      v-if="!isEdit"
      :x="textX"
      :y="y + 20"
      :font-weight="fontWeight"
      :text-anchor="textAnchor"
    >
      {{ inputText }}
    </text>
    <foreignObject
      v-if="isEdit"
      :x="x"
      :y="y"
      :width="width"
      :height="height"
      fill="transparent">
      <q-input
        v-model="inputText"
        autofocus
        dense
        filled
        type="text"
        @blur="isEdit = false"
        v-on:keyup.prevent.enter="isEdit = false"
      ></q-input>
    </foreignObject>
  </g>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontWeight?: string,
  textAnchor?: 'start' | 'middle' | 'end',
}>(), {
  textAnchor: 'start',
});

type Emit = {
  (e: 'update:modelValue', value: string): void
}
const emit = defineEmits<Emit>();

const textX = computed(
  () => {
    let x = 0;
    switch (props.textAnchor) {
      case 'start':
        x = props.x + 10;
        break;
      case 'middle':
        x = props.x + (props.width / 2);
        break;
      case 'end':
        x = props.x + props.width - 10;
        break;
      default:
        x = props.x + 10;
    }
    return x;
  },
);

const inputText = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const clickPath = computed(
  () => `M ${props.x} ${props.y} \
  H ${props.x + props.width} \
  V ${props.y + props.height} \
  H ${props.x} V ${props.y}`,
);

const isEdit = ref(false);
</script>

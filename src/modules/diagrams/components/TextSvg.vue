<template>
  // title area
  <g
    @dblclick="isEdit = true"
  >
    <path
      :d="titlePath"
      stroke="transparent"
      stroke-width="1"
      fill="transparent"
    />
    <text
      v-if="!isEdit"
      :x="x + 10"
      :y="y + 20"
      :font-weight="fontWeight"
      text-anchor="center"
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

const props = defineProps<{
  modelValue: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontWeight?: string
}>();

type Emit = {
  (e: 'update:modelValue', value: string): void
}
const emit = defineEmits<Emit>();

const inputText = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const titlePath = computed(
  () => `M ${props.x} ${props.y} \
  H ${props.x + props.width} \
  V ${props.y + props.height} \
  H ${props.x} V ${props.y}`,
);

const isEdit = ref(false);
</script>

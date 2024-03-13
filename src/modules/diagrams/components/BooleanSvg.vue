<template>
  <g
    @dblclick="isTrue = !isTrue"
  >
    <path
      :d="clickPath"
      stroke="transparent"
      stroke-width="1"
      fill="transparent"
    />
    <slot name="display" :isTrue="modelValue"></slot>
  </g>
</template>
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: boolean,
  x: number,
  y: number,
  width: number,
  height: number,
}>();

type Emit = (e: 'update:modelValue', value: boolean) => void;

const emit = defineEmits<Emit>();

const isTrue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const clickPath = computed(
  () => `M ${props.x} ${props.y} \
  H ${props.x + props.width} \
  V ${props.y + props.height} \
  H ${props.x} V ${props.y}`,
);
</script>

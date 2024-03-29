<template>
  // title area
  <g
    @dblclick="isEdit = true"
  >
    <path
      :d="clickPath"
      :stroke="stroke"
      :stroke-width="strokeWidth"
      fill="transparent"
    />
    <text
      v-if="!isEdit"
      :x="textX"
      :y="textY"
      :font-weight="fontWeight"
      :text-anchor="textAnchor"
      :font-size="fontSize"
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
        @blur="focusDiagramPanel"
        v-on:keyup.prevent.enter="focusDiagramPanel"
        @keydown.stop.delete
        @mousedown.stop
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
  verticalAlign?: 'top' | 'center' | 'bottom'
  strokeWidth?: string,
  stroke?: string,
  fontSize?: string,
}>(), {
  textAnchor: 'start',
  verticalAlign: 'top',
  strokeWidth: '1',
  stroke: 'transparent',
  fontSize: '12px',
});

type Emit = (e: 'update:modelValue', value: string) => void;

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

const textY = computed(
  () => {
    let y = 0;
    switch (props.verticalAlign) {
      case 'top':
        y = props.y + 20;
        break;
      case 'center':
        y = props.y + (props.height / 2) + 5;
        break;
      case 'bottom':
        y = props.y + props.height - 10;
        break;
      default:
        y = props.y + 20;
    }
    return y;
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

function focusDiagramPanel() {
  isEdit.value = false;
  // I have to refocus on diagramPanel, so the diagramPanel can be correctly triggered
  document.getElementById('diagramPanel')?.focus();
}
</script>

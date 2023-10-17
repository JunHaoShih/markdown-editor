<template>
  <g
    :transform="`translate(${x}, ${y})`"
    @mouseup.stop
    @mousedown.stop
  >
    <rect
      :width="width" :height="height" :rx="rx"
      stroke="black"
      stroke-width="0.5"
      fill="transparent"
    />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :width="width"
      :height="height"
      viewBox="0 -960 960 960"
    >
      <path
        :d="path"
        :fill="fill"
      />
    </svg>
  </g>
</template>
<script setup lang="ts">
interface ActionBtn {
  x: number,
  y: number,
  rx: number
  width: number,
  height: number,
  path: string,
  fill: string,
}

defineProps<ActionBtn>();
</script>

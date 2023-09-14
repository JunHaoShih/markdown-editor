<template>
  <svg>
    <circle
      :cx="x" :cy="y" r="40" stroke="green" stroke-width="4" fill="yellow"
      v-touch-pan.prevent.mouse="handleDrag"
    />
  </svg>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const x = ref(50);

const y = ref(50);

function handleDrag(details: {
  delta?: {
    x?: number,
    y?: number,
  },
}) {
  if (details.delta?.x) {
    x.value += details.delta.x;
  }
  if (details.delta?.y) {
    y.value += details.delta.y;
  }
}
</script>

<style lang="scss" scoped>
svg {
  width: 100%;
  height: calc(100vh - 60px);
}
</style>

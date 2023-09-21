<template>
  <svg>
    <EntitySvg
      v-for="shape in shapes"
      v-bind:key="shape.id"
      :x="shape.point.x"
      :y="shape.point.y"
      :name="shape.title"
    ></EntitySvg>
  </svg>
</template>

<script setup lang="ts">
import EntitySvg, { Point } from 'src/modules/diagrams/components/EntitySvg.vue';
import { onBeforeMount, ref } from 'vue';

interface Shape {
  id: number,
  point: Point,
  title: string,
}

const shapes: Shape[] = [];

onBeforeMount(() => {
  for (let i = 0; i < 3; i += 1) {
    shapes.push({
      id: i,
      point: { x: 50, y: 50 },
      title: `Title-${i}`,
    });
  }
});
</script>

<style lang="scss" scoped>
svg {
  width: 100%;
  height: calc(100vh - 60px);
}
</style>

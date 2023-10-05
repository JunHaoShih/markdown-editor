<template>
  <svg>
    <template
      v-for="(item, index) in diagram.shapes"
      v-bind:key="item.id"
    >
      <DbTableSvg
        v-if="item.type === 'dbTable'"
        v-model="diagram.shapes[index]"
      ></DbTableSvg>
    </template>
  </svg>
</template>
<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import DbTableSvg from './components/dbTable/DbTableSvg.vue';
import { Diagram, Shape } from './models/shape';

const diagram = ref<Diagram>({
  shapes: [],
  lines: [],
});

function createDbTable(x: number, y: number): Shape {
  return {
    id: uuidv4(),
    type: 'dbTable',
    x,
    y,
    title: 'Table name',
    dbColumns: [],
    extraSizeInfos: {
      icon: { width: 30, minWidth: 30 },
      name: { width: 90, minWidth: 90 },
      type: { width: 50, minWidth: 50 },
      label: { width: 30, minWidth: 30 },
    },
    height: 30,
    width: 200,
  };
}

onBeforeMount(() => {
  for (let i = 0; i < 3; i += 1) {
    diagram.value.shapes.push(createDbTable(50, 50));
  }
});
</script>

<style lang="scss" scoped>
svg {
  width: 100%;
  height: calc(100vh - 60px);
}
</style>

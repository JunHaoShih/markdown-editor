<template>
  <svg>
    <DbTableSvg
      v-for="(item, index) in shapes"
      v-bind:key="item.id"
      v-model="shapes[index]"
      v-model:data="dbTables[item.id]"
    ></DbTableSvg>
  </svg>
</template>
<script setup lang="ts">import { onBeforeMount, ref } from 'vue';
import { DbTable, createDbTable } from './components/dbTable/DbTable';
import { Shape, createShape } from './Shape';
import DbTableSvg from './components/dbTable/DbTableSvg.vue';

const shapes = ref<Shape[]>([]);

const dbTables = ref<Record<string, DbTable>>({});

onBeforeMount(() => {
  for (let i = 0; i < 3; i += 1) {
    const shape = createShape(50, 50);
    if (!dbTables.value[shape.id]) {
      dbTables.value[shape.id] = createDbTable();
    }
    shapes.value.push(shape);
  }
});
</script>

<style lang="scss" scoped>
svg {
  width: 100%;
  height: calc(100vh - 60px);
}
</style>

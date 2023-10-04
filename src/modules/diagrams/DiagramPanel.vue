<template>
  <svg>
    <DbTableSvg
      v-for="(item, index) in diagramStore.shapes"
      v-bind:key="item.id"
      v-model="diagramStore.shapes[index]"
      v-model:data="diagramStore.dbTables[item.id]"
    ></DbTableSvg>
  </svg>
</template>
<script setup lang="ts">import { onBeforeMount } from 'vue';
import { createDbTable } from './components/dbTable/DbTable';
import DbTableSvg from './components/dbTable/DbTableSvg.vue';
import { useDiagramStore } from './stores/diagramStore';

const diagramStore = useDiagramStore();

onBeforeMount(() => {
  for (let i = 0; i < 3; i += 1) {
    const dbTable = createDbTable();
    diagramStore.createDbTable(dbTable, 50, 50);
  }
});
</script>

<style lang="scss" scoped>
svg {
  width: 100%;
  height: calc(100vh - 60px);
}
</style>

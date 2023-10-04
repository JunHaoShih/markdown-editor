<template>
  <svg>
    <DbTableSvg
      v-for="(item, index) in diagramStore.diagram.getShapes()"
      v-bind:key="item.id"
      :controller="diagramStore.diagram.findTable(item.id)"
    ></DbTableSvg>
  </svg>
</template>
<script setup lang="ts">import { onBeforeMount } from 'vue';
import DbTableSvg from './components/dbTable/DbTableSvg.vue';
import { useDiagramStore } from './stores/diagramStore';
import { diagramInit } from './services/diagramService';

const diagramStore = useDiagramStore();

onBeforeMount(() => {
  diagramStore.diagram = diagramInit();
  for (let i = 0; i < 3; i += 1) {
    diagramStore.diagram.addTable(50, 50);
  }
});
</script>

<style lang="scss" scoped>
svg {
  width: 100%;
  height: calc(100vh - 60px);
}
</style>

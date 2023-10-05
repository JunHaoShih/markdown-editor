<template>
  <svg ref="svgRef">
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
import { onBeforeMount, onMounted, ref } from 'vue';
import DbTableSvg from './components/dbTable/DbTableSvg.vue';
import { Diagram } from './models/shape';
import { createDbTable } from './services/dbTableService';
import { useDiagramStore } from './stores/diagramStore';

const diagramStore = useDiagramStore();

const svgRef = ref<InstanceType<typeof SVGElement> | null>(null);

const diagram = ref<Diagram>({
  shapes: [],
  lines: [],
});

onMounted(() => {
  if (!svgRef.value) {
    return;
  }
  diagramStore.setBoudings(svgRef.value.getBoundingClientRect());
});

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

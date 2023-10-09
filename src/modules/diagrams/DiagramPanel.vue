<template>
  <svg ref="svgRef"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  >
    <line
      v-if="diagramStore.holdInfo.type === 'connect'"
      :x1="diagramStore.holdFrom.x"
      :y1="diagramStore.holdFrom.y"
      :x2="diagramStore.holdTo.x"
      :y2="diagramStore.holdTo.y"
      style="stroke:rgb(0, 0, 0);stroke-width:1"
    />
    <template
      v-for="(item, index) in diagramStore.diagram.shapes"
      v-bind:key="item.id"
    >
      <DbTableSvg
        v-if="item.type === 'dbTable'"
        v-model="diagramStore.diagram.shapes[index]"
      ></DbTableSvg>
    </template>
    <template
      v-for="(item, index) in diagramStore.diagram.lines"
      v-bind:key="item.id"
    >
      <LineSvg
        v-model="diagramStore.diagram.lines[index]"
      ></LineSvg>
    </template>
  </svg>
</template>
<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue';
import DbTableSvg from './components/dbTable/DbTableSvg.vue';
import LineSvg from './components/line/LineSvg.vue';
import { createDbTable } from './services/dbTableService';
import { useDiagramStore } from './stores/diagramStore';

const diagramStore = useDiagramStore();

const svgRef = ref<InstanceType<typeof SVGElement> | null>(null);

function onMouseMove(evt: MouseEvent) {
  diagramStore.movingByEvent(evt);
}

function onMouseUp() {
  if (diagramStore.holdType === 'connect') {
    if (diagramStore.holdInfo.holdToId) {
      diagramStore.diagram.lines.push({
        id: 'test',
        fromAbsolute: diagramStore.holdFrom,
        fromNode: diagramStore.holdInfo.holdFromId,
        toAbsolute: diagramStore.holdTo,
        toNode: diagramStore.holdInfo.holdToId,
      });
    }
  }
  diagramStore.endHolding();
}

onMounted(() => {
  if (!svgRef.value) {
    return;
  }
  diagramStore.setBoudings(svgRef.value.getBoundingClientRect());
});

onBeforeMount(() => {
  for (let i = 0; i < 3; i += 1) {
    diagramStore.diagram.shapes.push(createDbTable(50, 50));
  }
});
</script>

<style lang="scss" scoped>
svg {
  width: 100%;
  height: calc(100vh - 60px);
}
</style>

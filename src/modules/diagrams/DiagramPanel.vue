<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      unit="px"
      class="outer-max"
    >
      <template v-slot:before>
        <ShapePanel/>
      </template>
      <template v-slot:after>
        <svg ref="svgRef"
          @dragover="allowDrop"
          @drop="onDrop"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @keydown.delete="onDeleteClicked"
          tabindex="-1"
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
            <RectangleSvg
              v-if="item.type === 'rectangle'"
              v-model="diagramStore.diagram.shapes[index]"
            ></RectangleSvg>
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
    </q-splitter>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DbTableSvg from './components/dbTable/DbTableSvg.vue';
import LineSvg from './components/line/LineSvg.vue';
import RectangleSvg from './components/basicShapes/RectangleSvg.vue';
import { createDbTable } from './services/dbTableService';
import { useDiagramStore } from './stores/diagramStore';
import ShapePanel from './components/ShapePanel.vue';
import { ShapeType } from './models/shape';
import { createRectangle } from './services/basicShapeService';

const splitterModel = ref(200);

const diagramStore = useDiagramStore();

const svgRef = ref<InstanceType<typeof SVGElement> | null>(null);

function allowDrop(ev: DragEvent) {
  ev.preventDefault();
}

function onDrop(ev: DragEvent) {
  ev.preventDefault();
  const type = ev.dataTransfer?.getData('text') as ShapeType;
  if (!type) {
    return;
  }
  const mousePoint = diagramStore.pointShift({ x: ev.x, y: ev.y });
  if (type === 'dbTable') {
    diagramStore.diagram.shapes.push(createDbTable(mousePoint.x, mousePoint.y));
  } else if (type === 'rectangle') {
    diagramStore.diagram.shapes.push(createRectangle(mousePoint.x, mousePoint.y));
  }
}

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
  diagramStore.selectedIds.length = 0;
}

function onDeleteClicked() {
  diagramStore.selectedIds.forEach((id) => {
    const index = diagramStore.diagram.shapes.findIndex((shape) => shape.id === id);
    if (index === -1) {
      return;
    }
    diagramStore.diagram.shapes.splice(index, 1);
  });
  diagramStore.selectedIds.length = 0;
}

onMounted(() => {
  if (!svgRef.value) {
    return;
  }
  diagramStore.setBoudings(svgRef.value.getBoundingClientRect());
});
</script>

<style lang="scss" scoped>
svg {
  width: 100%;
  height: calc(100vh - 60px);
}
</style>

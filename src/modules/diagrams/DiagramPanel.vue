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
          id="diagramPanel"
          @dragover="allowDrop"
          @drop="onDrop"
          @mousemove="onMouseMove"
          @mousedown="onMouseDown"
          @mouseup="onMouseUp"
          @keydown.delete="onDeleteClicked"
          tabindex="-1"
        >
          <line
            v-if="diagramStore.holdInfo.type === 'connect'
            || diagramStore.holdInfo.type === 'reconnect'"
            :x1="diagramStore.holdFrom.x"
            :y1="diagramStore.holdFrom.y"
            :x2="diagramStore.holdTo.x"
            :y2="diagramStore.holdTo.y"
            stroke-dasharray="5,5"
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
            <LineSvg
              v-if="item.type === 'line'"
              v-model="diagramStore.diagram.shapes[index]"
            ></LineSvg>
          </template>
          <rect
            v-if="diagramStore.holdType === 'multiSelect'"
            :x="multiSelectTopLeftX" :y="multiSelectTopLeftY"
            :width="multiSelectBottomRightX - multiSelectTopLeftX"
            :height="multiSelectBottomRightY - multiSelectTopLeftY"
            fill="#29b6f2"
            fill-opacity="0.2"
            stroke="#29b6f2"
            stroke-width="1"
          />
          <rect
            v-if="diagramStore.holdType === 'drag'"
            :x="diagramStore.selectedSquare.x" :y="diagramStore.selectedSquare.y"
            :width="diagramStore.selectedSquare.width"
            :height="diagramStore.selectedSquare.height"
            fill="transparent"
            stroke="#29b6f2"
            stroke-width="1"
          />
        </svg>
      </template>
    </q-splitter>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import DbTableSvg from './components/dbTable/DbTableSvg.vue';
import LineSvg from './components/line/LineSvg.vue';
import RectangleSvg from './components/basicShapes/RectangleSvg.vue';
import { createDbTable } from './services/dbTableService';
import { HoldType, useDiagramStore } from './stores/diagramStore';
import ShapePanel from './components/ShapePanel.vue';
import { ShapeType } from './models/shape';
import { createRectangle } from './services/basicShapeService';
import { createLine } from './services/lineService';

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

const multiSelectTopLeftX = computed(
  () => Math.min(diagramStore.holdFrom.x, diagramStore.holdTo.x),
);

const multiSelectTopLeftY = computed(
  () => Math.min(diagramStore.holdFrom.y, diagramStore.holdTo.y),
);

const multiSelectBottomRightX = computed(
  () => Math.max(diagramStore.holdFrom.x, diagramStore.holdTo.x),
);

const multiSelectBottomRightY = computed(
  () => Math.max(diagramStore.holdFrom.y, diagramStore.holdTo.y),
);

function onMouseDown(evt: MouseEvent) {
  const shiftedPoint = diagramStore.pointShift({
    x: evt.x,
    y: evt.y,
  });
  diagramStore.startHolding('multiSelect', shiftedPoint.x, shiftedPoint.y);
}

function onMouseMove(evt: MouseEvent) {
  diagramStore.movingByEvent(evt);
}

const mouseUpRecord: Record<HoldType, () => void> = {
  none: () => { /** */ },
  connect: () => {
    if (diagramStore.holdInfo.holdToId) {
      diagramStore.diagram.shapes.push(createLine({
        fromAbsolute: {
          x: diagramStore.holdFrom.x,
          y: diagramStore.holdFrom.y,
        },
        fromNode: diagramStore.holdInfo.holdFromId,
        toAbsolute: {
          x: diagramStore.holdTo.x,
          y: diagramStore.holdTo.y,
        },
        toNode: diagramStore.holdInfo.holdToId,
      }));
      diagramStore.selectedIds.length = 0;
    }
  },
  reconnect: () => {
    const line = diagramStore.getHoldedLine();
    if (!line) {
      return;
    }
    if (diagramStore.holdInfo.movedNode === 'from') {
      line.fromNode = diagramStore.holdInfo.holdFromId;
    } else if (diagramStore.holdInfo.movedNode === 'to') {
      line.toNode = diagramStore.holdInfo.holdToId;
    }
  },
  multiSelect: () => {
    diagramStore.selectedIds.length = 0;
    diagramStore.diagram.shapes.forEach((shape) => {
      if (shape.position.x >= multiSelectTopLeftX.value
        && shape.position.x <= multiSelectBottomRightX.value
        && shape.position.y >= multiSelectTopLeftY.value
        && shape.position.y <= multiSelectBottomRightY.value
      ) {
        diagramStore.addSelectedId(shape.id);
      }
    });
  },
  drag: () => { /** */ },
};

function onMouseUp() {
  mouseUpRecord[diagramStore.holdType]();
  diagramStore.endHolding();
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

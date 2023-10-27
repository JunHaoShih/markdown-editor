<template>
  <circle
    v-if="isSelected"
    :cx="fromPoint.x"
    :cy="fromPoint.y"
    r="5"
    fill="#01bd22"
    @mousedown.stop="startConnectFrom"
  />
  <circle
    v-if="isSelected"
    :cx="toPoint.x"
    :cy="toPoint.y"
    r="5"
    fill="#01bd22"
    @mousedown.stop="startConnectTo"
  />
  <foreignObject
    v-if="isSelected"
    :x="actionPanelX"
    :y="actionPanelY"
    :width="1"
    :height="1"
    class="tw-overflow-visible"
    @mouseup.stop
    @mousedown.stop
  >
    <q-btn-dropdown
      dense
      class="glossy"
      color="teal"
      :label="$t('diagram.lineStart')"
    >
      <q-list>
        <q-item
          dense
          v-for="marker in markers"
          v-bind:key="marker.id"
          clickable v-close-popup
          @click="onArrowStartChanged(marker.id)"
        >
          <q-item-section avatar>
            <q-avatar icon="folder" color="primary" text-color="white" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t(marker.name) }}</q-item-label>
            <q-item-label caption>February 22, 2016</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon
              v-if="marker.id === line.arrowStart"
              name="info" color="amber"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <q-btn-dropdown
      dense
      class="glossy"
      color="teal"
      :label="$t('diagram.lineEnd')"
    >
      <q-list>
        <q-item
          v-for="marker in markers"
          v-bind:key="marker.id"
          clickable v-close-popup
          @click="onArrowEndChanged(marker.id)"
        >
          <q-item-section avatar>
            <q-avatar icon="folder" color="primary" text-color="white" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t(marker.name) }}</q-item-label>
            <q-item-label caption>February 22, 2016</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon
              v-if="marker.id === line.arrowEnd"
              name="info" color="amber"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </foreignObject>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { markers } from './line';
import { ArrowType, Shape } from '../../models/shape';
import { useDiagramStore } from '../../stores/diagramStore';

const diagramStore = useDiagramStore();

const props = defineProps<{
  modelValue: Shape,
}>();

type Emit = {
  (e: 'update:modelValue', value: Shape): void
}
const emit = defineEmits<Emit>();

const line = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const isSelected = computed(
  () => !!diagramStore.selectedIds.find((selected) => selected.id === line.value.id),
);

const fromPoint = computed(
  () => line.value.position,
);

const toPoint = computed(
  () => line.value.toAbsolute ?? { x: 0, y: 0 },
);

const fromNode = computed(
  () => (line.value.fromNode ? diagramStore.connectionNode(line.value.fromNode) : undefined),
);

const toNode = computed(
  () => (line.value.toNode ? diagramStore.connectionNode(line.value.toNode) : undefined),
);

function startConnectFrom() {
  diagramStore
    .startReconnectFrom('from', line.value.id, fromPoint.value, toPoint.value, fromNode.value?.id, toNode.value?.id);
}

function startConnectTo() {
  diagramStore
    .startReconnectFrom('to', line.value.id, fromPoint.value, toPoint.value, fromNode.value?.id, toNode.value?.id);
}

const actionPanelX = computed(
  () => Math.max(fromPoint.value.x, toPoint.value.x) + 30,
);

const actionPanelY = computed(
  () => Math.min(fromPoint.value.y, toPoint.value.y),
);

function onArrowEndChanged(type: ArrowType) {
  line.value.arrowEnd = type;
}

function onArrowStartChanged(type: ArrowType) {
  line.value.arrowStart = type;
}
</script>

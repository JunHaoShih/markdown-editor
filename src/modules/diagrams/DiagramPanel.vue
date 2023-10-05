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
import DbTableSvg from './components/dbTable/DbTableSvg.vue';
import { Diagram } from './models/shape';
import { createDbTable } from './services/dbTableService';

const diagram = ref<Diagram>({
  shapes: [],
  lines: [],
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

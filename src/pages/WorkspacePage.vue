<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      unit="px"
      class="outer-max"
    >
      <template v-slot:before>
        <WorkspaceTree
          :id="id"
          class="q-mx-sm"
        ></WorkspaceTree>
      </template>
      <template v-slot:after>
        <RouterView></RouterView>
      </template>
    </q-splitter>
  </div>
</template>

<script setup lang="ts">
import WorkspaceTree from 'src/modules/folderViews/components/WorkspaceTree.vue';
import { ref } from 'vue';

const splitterModel = ref(350);

const props = withDefaults(defineProps<{
  id?: string,
}>(), {
  id: '',
});
</script>

<style lang="sass" scoped>
.outer-max
  height: calc(100vh - 55px)
</style>

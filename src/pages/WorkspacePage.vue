<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      unit="px"
      class="outer-max tw-bg-white dark:tw-bg-darkBg"
      :dark="darkStore.isDark"
    >
      <template v-slot:before>
        <WorkspaceTree
          :id="id"
          :is-dark="darkStore.isDark"
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
import { useDarkStore } from 'src/stores/darkModeStore';
import { ref } from 'vue';

const splitterModel = ref(350);

const darkStore = useDarkStore();

withDefaults(defineProps<{
  id?: string,
}>(), {
  id: '',
});
</script>

<style lang="sass" scoped>
.outer-max
  height: calc(100vh - 50px)
</style>

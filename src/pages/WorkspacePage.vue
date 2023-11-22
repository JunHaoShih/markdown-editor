<template>
  <div class="outer-max tw-flex tw-flex-row tw-bg-white dark:tw-bg-stone-800 tw-ml-0.5">
    <div class="tw-flex-none">
      <q-btn
        icon="folder"
        class="action-btn q-pa-sm"
        @click="collapseOrExpand"
      >
        <q-tooltip>
          {{ $t('workspacePage.folderTree') }}
        </q-tooltip>
      </q-btn>
    </div>
    <div
      class="tw-w-px tw-flex tw-flex-col tw-justify-center tw-items-center
      tw-bg-stone-400 tw-ml-1"
    >
    </div>
    <div ref="leftDiv" class="tw-flex-none tw-w-0 sm:tw-w-80">
      <WorkspaceTree
        :id="id"
        :is-dark="darkStore.isDark"
        class="q-mx-sm tw-overflow-auto outer-max"
      ></WorkspaceTree>
    </div>
    <div
      class="tw-w-2 tw-cursor-ew-resize tw-flex tw-flex-col tw-justify-center tw-items-center
      hover:tw-bg-stone-400"
      v-touch-pan.prevent.mouse.touch.horizontal="resizeDrawer"
    >
      <div class="tw-bg-stone-400 tw-w-px tw-flex-auto"></div>
    </div>
    <div class="tw-flex-1 tw-overflow-auto">
      <RouterView></RouterView>
    </div>
  </div>
</template>

<script setup lang="ts">
import WorkspaceTree from 'src/modules/folderViews/components/WorkspaceTree.vue';
import { useDarkStore } from 'src/stores/darkModeStore';
import { onMounted, ref } from 'vue';

const leftDiv = ref<HTMLElement>();

const drawerMaxWidth = 500;

const defaultWidth = 320;

const collapse = ref(false);

const darkStore = useDarkStore();

withDefaults(defineProps<{
  id?: string,
}>(), {
  id: '',
});

let initialDrawerWidth = 0;

function resizeDrawer(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  if (!leftDiv.value) {
    return;
  }
  if (details.isFirst) {
    initialDrawerWidth = leftDiv.value.offsetWidth;
  }
  if (details.offset?.x) {
    leftDiv.value.style.width = `${Math.min(initialDrawerWidth + details.offset.x, drawerMaxWidth)}px`;
  }
}

function collapseTree() {
  if (!leftDiv.value) {
    return;
  }
  initialDrawerWidth = leftDiv.value.offsetWidth;
  leftDiv.value.style.width = '0px';
  collapse.value = true;
}

function expandTree() {
  if (!leftDiv.value) {
    return;
  }
  const previousWidth = Math.max(initialDrawerWidth, defaultWidth);
  const finalWidth = Math.min(previousWidth, drawerMaxWidth);
  leftDiv.value.style.width = `${finalWidth}px`;
  collapse.value = false;
}

function collapseOrExpand() {
  if (collapse.value) {
    expandTree();
  } else {
    collapseTree();
  }
}

onMounted(() => {
  if (!leftDiv.value) {
    return;
  }
  collapse.value = !!leftDiv.value.offsetWidth;
});
</script>

<style lang="sass" scoped>
.outer-max
  height: calc(100vh - 50px)
</style>

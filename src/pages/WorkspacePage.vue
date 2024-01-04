<template>
  <div
    class="outer-max tw-flex tw-flex-row tw-bg-white dark:tw-bg-stone-800 tw-ml-0.5"
    @keydown="handleKeyDown"
    ref="mainRef"
  >
    <div class="tw-flex tw-flex-col">
      <q-item
        v-for="item in items" v-bind:key="item.icon"
        :icon="item.icon"
        dense
        clickable
        :class="`tw-p-2 tw-mt-2 hover:tw-bg-stone-300 hover:dark:tw-bg-stone-600
          ${currentType === item.type ?
            'tw-text-primary-600' :
            'tw-text-black dark:tw-text-stone-300'}`"
        @click="currentType = currentType === item.type ? 'none' : item.type"
      >
        <q-tooltip>
          {{ $t(item.title) }}
        </q-tooltip>
        <q-icon :name="item.icon" size="24px"/>
        <q-badge
          v-if="item.type === 'files' && markdownsStore.repos.length > 0"
          color="red"
          floating
          transparent
        >
          {{ markdownsStore.repos.length }}
        </q-badge>
      </q-item>
    </div>
    <div
      class="tw-w-px tw-flex tw-flex-col tw-justify-center tw-items-center
      tw-bg-stone-400 tw-ml-1"
    >
    </div>
    <div ref="leftDiv" class="tw-flex-none tw-w-80">
      <WorkspaceTree
        ref="folderTree"
        :style="currentType !== 'explorer' ? 'display: none' : ''"
        :id="id"
        :is-dark="darkStore.isDark"
        class="q-mx-sm tw-overflow-auto outer-max"
      ></WorkspaceTree>
      <OpenedFileList
        ref="listRef"
        :id="id"
        :style="currentType !== 'files' ? 'display: none' : ''"
        :dark="darkStore.isDark"
      ></OpenedFileList>
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
import OpenedFileList from 'src/modules/folderViews/components/OpenedFileList.vue';
import WorkspaceTree from 'src/modules/folderViews/components/WorkspaceTree.vue';
import { useMarkdownsStore } from 'src/modules/markdown/stores/markdownsStore';
import { useDarkStore } from 'src/stores/darkModeStore';
import {
  onMounted, ref, watch,
} from 'vue';

const leftDiv = ref<HTMLElement>();

const mainRef = ref<HTMLElement>();

const folderTree = ref<InstanceType<typeof WorkspaceTree> | null>(null);

const listRef = ref<InstanceType<typeof OpenedFileList> | null>(null);

const drawerMaxWidth = 500;

const defaultWidth = 320;

const collapse = ref(false);

const darkStore = useDarkStore();

const markdownsStore = useMarkdownsStore();

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

type ItemType = 'explorer' | 'files' | 'none';

interface Item {
  type: ItemType,
  icon: string,
  title: string,
}

const currentType = ref<ItemType>('explorer');

const items: Item[] = [
  {
    type: 'explorer',
    icon: 'folder',
    title: 'workspacePage.folderTree',
  },
  {
    type: 'files',
    icon: 'list',
    title: 'workspacePage.openedFiles',
  },
];

watch(currentType, (newValue) => {
  if (newValue === 'none') {
    collapseTree();
  } else {
    expandTree();
  }
});

function handleKeyDown(event: KeyboardEvent) {
  if (event.ctrlKey && event.shiftKey && event.key === 'E') {
    currentType.value = 'explorer';
    folderTree.value?.focusTree();
  }
  if (event.ctrlKey && event.shiftKey && event.key === 'F') {
    currentType.value = 'files';
    listRef.value?.focusList();
  }
  if (event.ctrlKey && event.shiftKey && event.key === '!') {
    markdownsStore.triggerFocus = true;
  }
}

onMounted(() => {
  if (!leftDiv.value) {
    return;
  }
  collapse.value = !leftDiv.value.offsetWidth;
  currentType.value = 'explorer';
  folderTree.value?.focusTree();
});
</script>

<style lang="sass" scoped>
.outer-max
  height: calc(100vh - 50px)
</style>

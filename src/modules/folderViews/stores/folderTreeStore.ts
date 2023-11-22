import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { FolderTreeNode } from '../components/WorkspaceTree.vue';

/**
 * This is mainly used to store all parent nodes, so other page can display breadcrumbs of files
 */
export const useFolderTreeStore = defineStore('folderTree', () => {
  const selectedNodeParents = ref<FolderTreeNode[]>([]);

  const panelWidth = ref(0);

  const breadCrumbs = computed(() => selectedNodeParents.value);

  const fileName = computed(
    () => selectedNodeParents.value[selectedNodeParents.value.length - 1].label,
  );

  return {
    selectedNodeParents,
    panelWidth,
    breadCrumbs,
    fileName,
  };
});

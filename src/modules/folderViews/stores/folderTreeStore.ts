import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { FolderTreeNode } from '../components/WorkspaceTree.vue';

export type MoveAction = 'cut' | 'copy' | 'none';

/**
 * This is mainly used to store all parent nodes, so other page can display breadcrumbs of files
 */
export const useFolderTreeStore = defineStore('folderTree', () => {
  const selectedNodeParents = ref<FolderTreeNode[]>([]);

  const breadCrumbs = computed(() => selectedNodeParents.value);

  const fileName = computed(
    () => selectedNodeParents.value[selectedNodeParents.value.length - 1].label,
  );

  return {
    selectedNodeParents,
    breadCrumbs,
    fileName,
  };
});

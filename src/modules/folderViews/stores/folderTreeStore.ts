import { defineStore } from 'pinia';
import { FolderTreeNode } from '../components/FolderTree.vue';

interface FolderTreeContainer {
  selectedNodeParents: FolderTreeNode[],
}

/**
 * This is mainly used to store all parent nodes, so other page can display breadcrumbs of files
 */
export const useFolderTreeStore = defineStore('folderTree', {
  state: (): FolderTreeContainer => ({
    selectedNodeParents: [],
  }),
  getters: {
    breadCrumbs: (state): FolderTreeNode[] => state.selectedNodeParents,
  },
});

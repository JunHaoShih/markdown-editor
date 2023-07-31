import { defineStore } from 'pinia';
import { FolderTreeNode } from '../components/FolderTree.vue';

interface FolderTreeContainer {
  selectedNodeParents: FolderTreeNode[],
}

export const useFolderTreeStore = defineStore('folderTree', {
  state: (): FolderTreeContainer => ({
    selectedNodeParents: [],
  }),
  getters: {
    breadCrumbs: (state): FolderTreeNode[] => state.selectedNodeParents,
  },
});

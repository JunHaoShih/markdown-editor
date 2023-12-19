import { defineStore } from 'pinia';
import { QTreeNode } from 'quasar';
import { computed, ref } from 'vue';
import { FolderItem, FolderItemType } from '../models/folderView';

export interface FolderTreeNode extends QTreeNode {
  id: string,
  type: FolderItemType,
  ref?: FolderItem,
  parent?: FolderTreeNode | null,
  marked?: boolean,
  edited?: boolean,
}

/**
 * This is mainly used to store all parent nodes, so other page can display breadcrumbs of files
 */
export const useFolderTreeStore = defineStore('folderTree', () => {
  /**
   * The whole folder tree structure
   */
  const treeNodes = ref<FolderTreeNode[]>([]);

  /**
   * Store selected node and all of its parent. This is used for breadcrumb display
   */
  const selectedNodeParents = ref<FolderTreeNode[]>([]);

  const breadCrumbs = computed(() => selectedNodeParents.value);

  const fileName = computed(
    () => (selectedNodeParents.value.length > 0
      ? selectedNodeParents.value[selectedNodeParents.value.length - 1].label
      : null),
  );

  /**
   * Find filename from FolderTreeNode recursively
   * @param node Target tree node
   * @param id Markdown file id
   * @returns Markdown filename if exist
   */
  function findFileNameFromNode(node: FolderTreeNode, id: string): string | null | undefined {
    if (node.id === id) {
      return node.label;
    }
    if (!node.children) {
      return null;
    }
    for (let i = 0; i < node.children.length; i += 1) {
      const result = findFileNameFromNode(node.children[i] as FolderTreeNode, id);
      if (result) {
        return result;
      }
    }
    return null;
  }

  /**
   * Find markdown filename from folder tree
   * @param id Markdown file id
   * @returns Markdown filename if exist
   */
  function findFileName(id: string): string | null {
    for (let i = 0; i < treeNodes.value.length; i += 1) {
      const result = findFileNameFromNode(treeNodes.value[i], id);
      if (result) {
        return result;
      }
    }
    return null;
  }

  return {
    treeNodes,
    selectedNodeParents,
    breadCrumbs,
    fileName,
    findFileName,
  };
});

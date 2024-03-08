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

  const expandedKeys = ref<string[]>([]);

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

  function findNextNodeBelow(currentNode: FolderTreeNode): FolderTreeNode | null {
    const { parent } = currentNode;
    if (!parent?.children) {
      return null;
    }
    const index = parent.children.findIndex((node) => node.id === currentNode.id);
    if (index === parent.children.length - 1) {
      return findNextNodeBelow(parent);
    }
    return parent.children[index + 1] as FolderTreeNode;
  }

  /**
   * Get the next node below current node if possible
   * @param currentNode Starting node
   * @param isExpanded The function to determine if specific node is expanded
   * @param defaultId Default return id if not found
   * @returns Next node id below current node
   */
  function getNextNodeBelow(
    currentNode: FolderTreeNode | null,
    isExpanded: (id: string) => boolean | undefined,
    defaultId: string,
  ): string {
    if (!currentNode) {
      return defaultId;
    }
    if (isExpanded(currentNode.id) && currentNode.children) {
      const childNode = currentNode.children[0] as FolderTreeNode;
      return childNode.id;
    }
    const nextNode = findNextNodeBelow(currentNode);
    if (nextNode) {
      return nextNode.id;
    }
    return currentNode.id;
  }

  function getBottomMostNode(
    currentNode: FolderTreeNode,
    isExpanded: (id: string) => boolean | undefined,
  ): FolderTreeNode {
    if (!isExpanded(currentNode.id)) {
      return currentNode;
    }
    if (!currentNode.children || currentNode.children.length === 0) {
      return currentNode;
    }
    const lastNode = currentNode.children[currentNode.children.length - 1] as FolderTreeNode;
    return getBottomMostNode(lastNode, isExpanded);
  }

  /**
   * Get the next node above current node if possible
   * @param currentNode Starting node
   * @param isExpanded The function to determine if specific node is expanded
   * @param defaultId Default return id if not found
   * @returns Next node id above current node
   */
  function getNextNodeAbove(
    currentNode: FolderTreeNode | null,
    isExpanded: (id: string) => boolean | undefined,
    defaultId: string,
  ): string {
    if (!currentNode) {
      return defaultId;
    }
    const { parent } = currentNode;
    if (!parent?.children || parent.children.length === 0) {
      return currentNode.id;
    }
    const index = parent.children.findIndex((child) => child.id === currentNode.id);
    if (index <= 0) {
      return parent.id;
    }
    const rootNode = parent.children[index - 1] as FolderTreeNode;
    const nextNode = getBottomMostNode(rootNode, isExpanded);
    return nextNode.id;
  }

  function getStepOutNode(
    currentNode: FolderTreeNode | null,
    isExpanded: (id: string) => boolean | undefined,
    setExpanded: (id: string, expand: boolean) => void,
    defaultId: string,
  ): string {
    if (!currentNode) {
      return defaultId;
    }
    if (isExpanded(currentNode.id)) {
      setExpanded(currentNode.id, false);
      return currentNode.id;
    }
    if (!currentNode.parent) {
      return currentNode.id;
    }
    return currentNode.parent.id;
  }

  function getStepInNode(
    currentNode: FolderTreeNode | null,
    isExpanded: (id: string) => boolean | undefined,
    setExpanded: (id: string, expand: boolean) => void,
    defaultId: string,
  ): string {
    if (!currentNode) {
      return defaultId;
    }
    if (!currentNode.children || currentNode.children.length === 0) {
      return currentNode.id;
    }
    if (!isExpanded(currentNode.id)) {
      setExpanded(currentNode.id, true);
      return currentNode.id;
    }
    const first = currentNode.children[0] as FolderTreeNode;
    return first.id;
  }

  function toFolderTreeNodes(folderItems: FolderItem[]): FolderTreeNode[] {
    const children = folderItems.map((item):FolderTreeNode => ({
      label: item.name,
      icon: item.type,
      id: item.id,
      type: item.type,
      ref: item,
      children: toFolderTreeNodes(item.children),
    }));
    children.forEach((child) => {
      child.children?.forEach((subChild) => {
        subChild.parent = child;
      });
    });
    return children;
  }

  /**
   * Initialize folder tree nodes
   * @param folderItems Children of root nodes
   * @param rootName Root node name
   * @param workspaceRoot root node id
   */
  function folderViewInit(folderItems: FolderItem[], rootName: string, workspaceRoot: string) {
    const rootNode: FolderTreeNode = {
      label: rootName,
      icon: 'home',
      id: workspaceRoot,
      type: 'article',
      children: toFolderTreeNodes(folderItems),
    };
    rootNode.children?.forEach((child) => {
      child.parent = rootNode;
    });
    treeNodes.value = [rootNode];
  }

  function allParents(node: FolderTreeNode): FolderTreeNode[] {
    const arr: FolderTreeNode[] = [];
    if (!node) {
      return arr;
    }
    arr.push(node);
    if (node.parent) {
      return arr.concat(allParents(node.parent));
    }
    return arr;
  }

  /**
   * Expand specific node
   * @param key node key
   */
  function expandNode(key: string) {
    if (!expandedKeys.value.find((expandedKey) => expandedKey === key)) {
      expandedKeys.value.push(key);
    }
  }

  /**
   * Update breadcrumbs
   * @param node The node you want to display
   */
  function updateBreadcrumbs(node: FolderTreeNode) {
    const parents = allParents(node);
    selectedNodeParents.value = parents.slice().reverse();
    selectedNodeParents.value.forEach(
      (p) => expandNode(p.id),
    );
  }

  return {
    treeNodes,
    expandedKeys,
    selectedNodeParents,
    breadCrumbs,
    fileName,
    findFileName,
    getNextNodeBelow,
    getNextNodeAbove,
    getStepOutNode,
    getStepInNode,
    folderViewInit,
    updateBreadcrumbs,
    expandNode,
  };
});

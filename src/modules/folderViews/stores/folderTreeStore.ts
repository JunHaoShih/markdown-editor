import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { setMarkdown } from 'src/modules/markdown/services/markdownService';
import { FolderTreeNode } from '../components/FolderTree.vue';
import { FolderItem, FolderItemType, FolderView } from '../models/folderView';
import { TrashBin } from '../models/trashBin';

export type MoveAction = 'cut' | 'copy' | 'none';

interface FolderTreeContainer {
  selectedNodeParents: FolderTreeNode[],
  expandedKeys: string[],
  markedKey?: string,
  movedAction: MoveAction,
  folderView: FolderView,
  trashBin: TrashBin,
  selectedNodeKey: string
  folderTreeNodes: FolderTreeNode[],
}

/**
 * This is mainly used to store all parent nodes, so other page can display breadcrumbs of files
 */
export const useFolderTreeStore = defineStore('folderTree', {
  state: (): FolderTreeContainer => ({
    selectedNodeParents: [],
    expandedKeys: [],
    movedAction: 'none',
    folderView: {
      name: '',
      content: [],
      userId: '',
    },
    trashBin: {
      name: '',
      content: [],
      userId: '',
    },
    selectedNodeKey: '',
    folderTreeNodes: [],
  }),
  getters: {
    breadCrumbs: (state): FolderTreeNode[] => state.selectedNodeParents,
  },
  actions: {
    expandNode(key: string) {
      if (!this.expandedKeys.find((expandedKey) => expandedKey === key)) {
        this.expandedKeys.push(key);
      }
    },
    /**
     * Parse folder item array to folder tree
     * @param folderItems Folder item array you want to parse
     * @returns Tree nodes
     */
    toFolderTreeNodes(folderItems: FolderItem[]): FolderTreeNode[] {
      const children = folderItems.map((item):FolderTreeNode => ({
        label: item.name,
        icon: item.type,
        id: item.id,
        type: item.type,
        ref: item,
        children: this.toFolderTreeNodes(item.children),
      }));
      children.forEach((child) => {
        child.children?.forEach((subChild) => {
          subChild.parent = child;
        });
      });
      return children;
    },
    /**
     * Get all the parent nodes
     * @param node The node you want find all the parent
     * @returns All parent FolderTreeNode
     */
    allParents(node: FolderTreeNode): FolderTreeNode[] {
      const arr: FolderTreeNode[] = [];
      if (!node) {
        return arr;
      }
      arr.push(node);
      if (node.parent) {
        return arr.concat(this.allParents(node.parent));
      }
      return arr;
    },
    /**
     * Update breadcrumb to folderTreeStore
     * @param node current node
     */
    updateBreadcrumbs(node: FolderTreeNode) {
      const parents = this.allParents(node);
      this.selectedNodeParents = parents.reverse();
      this.selectedNodeParents.forEach(
        (p) => this.expandNode(p.id),
      );
    },
    selectedNodeKeyInit(path: string) {
      const pathTokens = path.split('/');
      const itemId = pathTokens[1];
      this.selectedNodeKey = itemId;
    },
    folderViewInit(folderView: FolderView, routePath: string) {
      this.folderView = folderView;
      const rootNode: FolderTreeNode = {
        label: this.folderView.name,
        icon: 'home',
        id: '',
        type: 'article',
        children: this.toFolderTreeNodes(this.folderView.content),
      };
      rootNode.children?.forEach((child) => {
        child.parent = rootNode;
      });
      this.folderTreeNodes = [rootNode];
      this.selectedNodeKeyInit(routePath);
    },
    trashBinInit(trashBin: TrashBin) {
      this.trashBin = trashBin;
    },
    cutAndPaste(
      targetNode: FolderTreeNode,
      parentNode: FolderTreeNode,
      markedNode: FolderTreeNode,
      newNodeName: string,
    ) {
      // Remove folder item from parent
      const refChildren = parentNode.ref
        ? parentNode.ref.children
        : this.folderView.content;
      const index = refChildren.findIndex((child) => child.id === markedNode.id);
      const removedFolderItem = refChildren.splice(index, 1)[0];
      // Rename folder item
      removedFolderItem.name = newNodeName;
      // Remove node from parent
      if (parentNode.children) {
        const nodeIndex = parentNode.children.findIndex((child) => child.id === markedNode.id);
        parentNode.children.splice(nodeIndex, 1);
      }
      markedNode.label = newNodeName;
      // Move folder item to target folder item
      if (targetNode.ref) {
        targetNode.ref.children.push(removedFolderItem);
      } else {
        this.folderView.content.push(removedFolderItem);
      }
      // Move marked node to new node
      if (targetNode.children) {
        targetNode.children.push(markedNode);
      } else {
        targetNode.children = [markedNode];
      }
      markedNode.parent = targetNode;
    },
    /**
     * Add new folder item and markdown file
     * @param itemName File name
     * @param type File type
     * @param node Target node
     * @param defaultContent Default markdown content if necessary
     * @returns Id of markdown file
     */
    async addNewItem(
      itemName: string,
      type: FolderItemType,
      node: FolderTreeNode,
      defaultContent?: string,
    ): Promise<string> {
      const id = uuidv4();
      // Create new folder item
      const newItem: FolderItem = {
        id,
        name: itemName,
        type,
        children: [],
      };
      // Add new tree node and set reference
      node.children?.push({
        label: itemName,
        icon: type,
        id,
        type,
        ref: newItem,
        parent: node,
        children: [],
      } as FolderTreeNode);
      // We expand folder node here so user don't need to expand again
      this.expandNode(node.id);
      // Update folder view
      if (node.ref) {
        node.ref.children.push(newItem);
      } else {
        this.folderView.content.push(newItem);
      }
      const newContent = defaultContent ?? `# ${itemName}`;
      // Set markdown document
      await setMarkdown({
        content: newContent,
        userId: this.folderView.userId,
      }, id);
      return id;
    },
    updateEditState(nodes: FolderTreeNode[], ids: string[]) {
      nodes.forEach((node) => {
        node.edited = !!ids.find((id) => id === node.id);
        if (node.children) {
          this.updateEditState(node.children as FolderTreeNode[], ids);
        }
      });
    },
  },
});

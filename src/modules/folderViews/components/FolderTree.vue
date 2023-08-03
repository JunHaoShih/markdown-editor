<template>
  <div
    v-on:keydown.esc.prevent="cancelMarked"
    tabindex="-1"
  >
    <q-btn
      icon="description"
      class="action-btn q-pa-sm"
      @click="addFile"
    >
      <q-tooltip>
        {{ $t('folderViews.addFile') }}
      </q-tooltip>
    </q-btn>
    <q-separator
      class="q-ma-sm"
    />
    <q-tree
      dense
      ref="treeRef"
      :nodes="folderTreeNodes"
      node-key="id"
      v-model:selected="selectedNodeKey"
      v-model:expanded="expandedKeys"
      selected-color="primary"
      :duration="0"
      no-selection-unset
    >
      <template v-slot:default-header="prop">
        <div :class="prop.node.marked ? 'filter-marked' : ''">
          <div class="row items-center">
            <q-icon :name="prop.node.icon" class="q-mr-sm"></q-icon>
            <q-icon
              v-if="(prop.node as FolderTreeNode).edited"
              name="adjust"
              color="amber"
              class="q-mr-sm"
            ></q-icon>
            <div>{{ prop.node.label }}</div>
          </div>
        </div>
        <q-menu
          touch-position
          context-menu
        >
          <q-list dense style="min-width: 100px">
            <q-item
              clickable
              v-close-popup
            >
              <q-item-section>
                <div
                  @click="addFileByRightClick(prop.node)"
                >
                  <q-icon name="description" color="primary"/>
                  {{ $t('folderViews.addFile') }}
                </div>
              </q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              v-if="(prop.node as FolderTreeNode).id"
            >
              <q-item-section>
                <div
                  @click="setRenameDialog($t('folderViews.rename'), prop.node)"
                >
                  <q-icon name="edit" color="primary"/>
                  {{ $t('actions.rename') }}
                </div>
              </q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              v-if="(prop.node as FolderTreeNode).id"
              @click="onDeleteClicked(prop.node)"
            >
              <q-item-section>
                <div>
                  <q-icon name="delete" color="red"/>
                  {{ $t('actions.delete') }}
                </div>
              </q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              v-if="(prop.node as FolderTreeNode).id"
              @click="onCutClicked(prop.node)"
            >
              <q-item-section>
                <div>
                  <q-icon name="content_cut" color="primary"/>
                  {{ $t('actions.cut') }}
                </div>
              </q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              v-if="(prop.node as FolderTreeNode).id"
              @click="onCopyClicked(prop.node)"
            >
              <q-item-section>
                <div>
                  <q-icon name="content_copy" color="primary"/>
                  {{ $t('actions.copy') }}
                </div>
              </q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              v-if="movedAction != 'none' && pastable(prop.node)"
              @click="onPasteClicked(prop.node)"
            >
              <q-item-section>
                <div>
                  <q-icon name="content_paste" color="primary"/>
                  {{ $t('actions.paste') }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </template>
    </q-tree>
    <NewFileDialog
      ref="dialogRef"
    ></NewFileDialog>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, ref, watch } from 'vue';
import { QTree, QTreeNode, useQuasar } from 'quasar';
import { v4 as uuidv4 } from 'uuid';
import { auth } from 'src/boot/firebase';
import { setMarkdown } from 'src/modules/markdown/services/markdownService';
import { setDefaultFolderView } from 'src/modules/folderViews/services/folderViewService';
import { useMarkdownsStore } from 'src/modules/markdown/stores/markdownsStore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  onBeforeRouteUpdate, useRoute, useRouter,
} from 'vue-router';
import { FolderItemType, FolderView, FolderItem } from '../models/folderView';
import { getMarkdownFolderView, setFolderView } from '../services/folderViewService';
import NewFileDialog from './NewFileDialog.vue';
import { useFolderTreeStore } from '../stores/folderTreeStore';
import { getTrashBin, setDefaultTrashBin, setTrashBin } from '../services/trashBinService';
import { TrashBin } from '../models/trashBin';

export interface FolderTreeNode extends QTreeNode {
  id: string,
  type: FolderItemType,
  ref?: FolderItem,
  parent?: FolderTreeNode | null,
  marked?: boolean,
  edited?: boolean,
}

type MoveAction = 'cut' | 'copy' | 'none';

const $q = useQuasar();

const i18n = useI18n();

const router = useRouter();

const route = useRoute();

const folderTreeStore = useFolderTreeStore();

const markdownsStore = useMarkdownsStore();

const dialogRef = ref<InstanceType<typeof NewFileDialog> | null>(null);

const treeRef = ref<QTree>();

/**
 * All the node keys that is expanded in the tree
 */
const expandedKeys = ref<string[]>([]);

function expandNode(key: string) {
  if (!expandedKeys.value.find((expandedKey) => expandedKey === key)) {
    expandedKeys.value.push(key);
  }
}

const markedKey = ref<string>();

const movedAction = ref<MoveAction>('none');

const folderView = ref<FolderView>({
  name: '',
  content: [],
  userId: '',
});

const trashBin = ref<TrashBin>({
  name: '',
  content: [],
  userId: '',
});

/**
 * Current selected node's key
 */
const selectedNodeKey = ref('');

const selectedNode = computed(
  (): FolderTreeNode | null => treeRef.value?.getNodeByKey(selectedNodeKey.value),
);

const folderTreeNodes = ref<FolderTreeNode[]>([]);

/**
 * Parse folder item array to folder tree
 * @param folderItems Folder item array you want to parse
 */
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
 * Add new item to folder view and update tree
 * @param itemName Item name
 * @param type Item type
 */
async function addNewItem(itemName: string, type: FolderItemType, node: FolderTreeNode) {
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
  treeRef.value?.setExpanded(node.id, true);
  // Update folder view
  if (node.ref) {
    node.ref.children.push(newItem);
  } else {
    folderView.value.content.push(newItem);
  }
  // Set markdown document
  await setMarkdown({
    content: `# ${itemName}`,
    userId: folderView.value.userId,
  }, id);
  router.push(`/${id}`);
}

function setupDialog(title: string, type: FolderItemType, node: FolderTreeNode) {
  // Get children item names in order to check if filename already exist
  const itemNames = node.ref
    ? node.ref.children.map((item) => item.name)
    : folderView.value.content.map((item) => item.name);
  if (dialogRef.value) {
    dialogRef.value.setTitle(title);
    dialogRef.value.setFileNames(itemNames);
    dialogRef.value.setFileName('');
    dialogRef.value.onConfirm(async (folderName) => {
      await addNewItem(folderName, type, node);
      dialogRef.value?.closeDialog();
    });
    dialogRef.value.promptDialog();
  }
}

function addFile() {
  if (!selectedNode.value) {
    $q.notify({
      type: 'error',
      message: i18n.t('folderViews.selectOneNodeToContinue'),
    });
    return;
  }
  setupDialog(i18n.t('folderViews.addFile'), 'article', selectedNode.value);
}

function addFileByRightClick(node: FolderTreeNode) {
  setupDialog(i18n.t('folderViews.addFile'), 'article', node);
}

/**
 * Rename
 * @param title Rename dialog title
 * @param node selected node
 */
function setRenameDialog(title: string, node: FolderTreeNode) {
  // Get children item names of parent node in order to check if filename already exist
  const itemNames = node.parent?.children
    ? node.parent.children
      .map((child) => child.label)
      .filter((itemName): itemName is string => !!itemName)
      .filter((itemName) => itemName !== node.label)
    : [];
  if (dialogRef.value) {
    dialogRef.value.setTitle(title);
    dialogRef.value.setFileNames(itemNames);
    dialogRef.value.setFileName(node.label ?? '');
    dialogRef.value.onConfirm(async (folderName) => {
      // Rename here
      node.label = folderName;
      if (node.ref) {
        node.ref.name = folderName;
      }
      dialogRef.value?.closeDialog();
    });
    dialogRef.value.promptDialog();
  }
}

/**
 * Delete file
 * @param node The node you want to delete
 */
function deleteNodeAndFolderItem(node: FolderTreeNode) {
  if (!node.ref) {
    $q.notify({
      type: 'error',
      message: i18n.t('unknownError'),
    });
    return;
  }
  const parentNode = node.parent;
  if (!parentNode) {
    $q.notify({
      type: 'error',
      message: i18n.t('folderViews.cannotDeleteRoot'),
    });
    return;
  }
  // Move folder item to trash bin
  trashBin.value.content.push(node.ref);
  // Get children of parent folder item
  const targetChildren = parentNode.id
    ? parentNode.ref?.children
    : folderView.value.content;
  const index = targetChildren?.findIndex((child) => child.id === node.id);
  if (index !== undefined && index >= 0) {
    targetChildren?.splice(index, 1);
  }
  // Delete tree node
  const nodeIndex = parentNode.children?.findIndex((child) => child.id === node.id);
  if (nodeIndex !== undefined && nodeIndex >= 0) {
    parentNode.children?.splice(nodeIndex, 1);
  }
  // Push route to parent node page after delete
  router.push(`/${parentNode.id}`);
}

/**
 * On delete context menu clicked
 * @param node The node you want to delete
 */
function onDeleteClicked(node: FolderTreeNode) {
  $q.dialog({
    dark: true,
    title: i18n.t('actions.delete'),
    message: i18n.t('folderViews.deleteConfirm'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    deleteNodeAndFolderItem(node);
  });
}

/**
 * Unmark node and reset markedKey and moveAction
 */
function cancelMarked() {
  const markedNode: FolderTreeNode | undefined = treeRef.value?.getNodeByKey(markedKey.value);
  if (markedNode) {
    markedNode.marked = false;
    movedAction.value = 'none';
    markedKey.value = undefined;
  }
}

/**
 * On cut context menu clicked
 * @param node Target node
 */
function onCutClicked(node: FolderTreeNode) {
  cancelMarked();
  // Marked the node on the tree
  node.marked = true;
  markedKey.value = node.id;
  movedAction.value = 'cut';
}

function onCopyClicked(node: FolderTreeNode) {
  cancelMarked();
  // We don't need to mark the node on copy, so just set markedKey
  markedKey.value = node.id;
  movedAction.value = 'copy';
}

/**
 * This method is used when there is duplicate filename in a folder.
 * It will return available new name
 * @param names Names that should not be duplicated
 * @param targetName the name you want to check
 * @param starter suffix number
 */
function getValidName(names: string[], targetName: string, starter: number) {
  const currentName = `${targetName} (${starter})`;
  if (names.find((name) => name === currentName)) {
    return getValidName(names, targetName, starter + 1);
  }
  return currentName;
}

/**
 * Get all the parent nodes
 * @param node The node you want find all the parent
 */
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
 * Update breadcrumb to folderTreeStore
 * @param node current node
 */
function updateBreadcrumbs(node: FolderTreeNode) {
  const parents = allParents(node);
  folderTreeStore.selectedNodeParents = parents.reverse();
  folderTreeStore.selectedNodeParents.forEach((p) => expandNode(p.id));
}

function pasteFromCut(node: FolderTreeNode) {
  const itemNames = node.children
    ? node.children.map((child) => child.label ?? '')
    : [];
  const markedNode: FolderTreeNode | undefined = treeRef.value?.getNodeByKey(markedKey.value);
  if (!markedNode) {
    return;
  }
  const markedNodeName = markedNode.label ?? '';
  // Get a valid name if duplicate found
  const newNodeName = itemNames.find((item) => item === markedNodeName)
    ? getValidName(itemNames, markedNodeName, 1)
    : markedNodeName;
  const parentNode = markedNode.parent;
  if (parentNode) {
    // Remove folder item from parent
    const refChildren = parentNode.ref
      ? parentNode.ref.children
      : folderView.value.content;
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
    if (node.ref) {
      node.ref.children.push(removedFolderItem);
    } else {
      folderView.value.content.push(removedFolderItem);
    }
    // Move marked node to new node
    if (node.children) {
      node.children.push(markedNode);
    } else {
      node.children = [markedNode];
    }
    markedNode.parent = node;
  } else {
    $q.notify({
      type: 'error',
      message: `${i18n.t('unknownError')}. Canot find parnet of marked node`,
    });
  }
}

function onPasteClicked(node: FolderTreeNode) {
  if (movedAction.value === 'cut') {
    pasteFromCut(node);
  } else if (movedAction.value === 'copy') {
    // TODO implement copy and paste
  }
  // We should always update breadcrumb on paste to prevent breadcrumb desync
  if (selectedNode.value) {
    updateBreadcrumbs(selectedNode.value);
  }
  expandNode(node.id);
  cancelMarked();
}

/**
 * Get all node childen node and itself's id list
 * @param node Target node
 */
function getChildrenIds(node: FolderTreeNode): string[] {
  const ids: string[] = [];
  ids.push(node.id);
  if (!node.children || node.children.length === 0) {
    return ids;
  }
  const re = node.children.map((child) => getChildrenIds(child as FolderTreeNode));
  const childrenIds = re.reduce((previousArr, currentArr) => previousArr.concat(currentArr));
  return ids.concat(childrenIds);
}

/**
 * Check is node pastable
 * @param node Target node
 */
function pastable(node: FolderTreeNode) {
  const markedNode: FolderTreeNode | undefined = treeRef.value?.getNodeByKey(markedKey.value);
  if (markedNode && movedAction.value === 'cut') {
    if (markedNode.parent?.id === node.id) {
      return false;
    }
    const childrenIds = getChildrenIds(markedNode);
    // Target node cannot be one of marked node and its children
    return !childrenIds.find((childId) => childId === node.id);
  }
  if (markedNode && movedAction.value === 'copy') {
    return true;
  }
  return false;
}

/**
 * Initialize selected node by route path
 * @param path Route path
 */
function selectedNodeKeyInit(path: string) {
  const pathTokens = path.split('/');
  const itemId = pathTokens[1];
  selectedNodeKey.value = itemId;
}

/**
 * Initialize folder tree on user authed
 */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Use userId to get folder view
    let reload = false;
    const markdownFolderView = await getMarkdownFolderView(user.uid);
    if (markdownFolderView) {
      folderView.value = markdownFolderView;
      const rootNode: FolderTreeNode = {
        label: folderView.value.name,
        icon: 'home',
        id: '',
        type: 'article',
        children: toFolderTreeNodes(folderView.value.content),
      };
      rootNode.children?.forEach((child) => {
        child.parent = rootNode;
      });
      folderTreeNodes.value = [rootNode];
      selectedNodeKeyInit(route.path);
    } else {
      await setDefaultFolderView(user.uid);
      reload = true;
    }
    const trashBinDoc = await getTrashBin(user.uid);
    if (trashBinDoc) {
      trashBin.value = trashBinDoc;
    } else {
      await setDefaultTrashBin(user.uid);
      reload = true;
    }
    if (reload) {
      window.location.reload();
    }
  }
});

/**
 * Update folder view to Firestore on value changed
 */
watch(folderView, async (newValue, oldValue) => {
  if (oldValue.name) {
    await setFolderView(newValue);
  }
}, {
  deep: true,
});

/**
 * Update trash bin to Firestore on value changed
 */
watch(trashBin, async (newValue, oldValue) => {
  if (oldValue.name) {
    await setTrashBin(newValue);
  }
}, {
  deep: true,
});

/**
 * Update all paremt nodes(for breadcrumbs) and push route on selected node change
 */
watch(selectedNodeKey, (newValue) => {
  const targetNode = treeRef.value?.getNodeByKey(newValue);
  if (!targetNode) {
    router.push('/');
    return;
  }
  updateBreadcrumbs(targetNode);
  router.push(`/${newValue}`);
});

function updateEditState(nodes: FolderTreeNode[], ids: string[]) {
  nodes.forEach((node) => {
    node.edited = !!ids.find((id) => id === node.id);
    if (node.children) {
      updateEditState(node.children as FolderTreeNode[], ids);
    }
  });
}

watch(() => markdownsStore.unsavedIds, () => {
  updateEditState(folderTreeNodes.value, markdownsStore.unsavedIds);
});

function unsavedWarning(event: BeforeUnloadEvent) {
  event.preventDefault();
  const message = 'You have unsaved changes. Are you sure you wish to leave?';
  event.returnValue = message;
  return message;
}

/**
 * Pop warning on leave if there is any unsaved file
 */
watch(() => markdownsStore.hasUnsaved, (newValue) => {
  if (newValue) {
    window.addEventListener('beforeunload', unsavedWarning);
  } else {
    window.removeEventListener('beforeunload', unsavedWarning);
  }
});

/**
 * Initialize selected node on route update
 */
onBeforeRouteUpdate((to) => {
  selectedNodeKeyInit(to.path);
});
</script>

<style lang="sass" scoped>
.filter-marked
  filter: opacity(50%)
</style>

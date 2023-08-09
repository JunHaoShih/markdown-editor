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
      :nodes="treeNodes"
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
              :class="!pastable(prop.node) ? 'hidden' : ''"
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
import {
  computed, onBeforeMount, ref, watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { QTree, QTreeNode, useQuasar } from 'quasar';
import { v4 as uuidv4 } from 'uuid';
import { onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { auth } from 'src/boot/firebase';
import { useMarkdownsStore } from 'src/modules/markdown/stores/markdownsStore';
import { getMarkdown, setMarkdown, updateDelete } from 'src/modules/markdown/services/markdownService';
import { getValidName } from 'src/services/fileNameService';
import NewFileDialog from './NewFileDialog.vue';
import { getMarkdownFolderView, setDefaultFolderView, setFolderView } from '../services/folderViewService';
import { FolderItem, FolderItemType, FolderView } from '../models/folderView';
import { getTrashBin, setDefaultTrashBin, setTrashBin } from '../services/trashBinService';
import { TrashBin } from '../models/trashBin';
import { MoveAction, useFolderTreeStore } from '../stores/folderTreeStore';

export interface FolderTreeNode extends QTreeNode {
  id: string,
  type: FolderItemType,
  ref?: FolderItem,
  parent?: FolderTreeNode | null,
  marked?: boolean,
  edited?: boolean,
}

const $q = useQuasar();

const i18n = useI18n();

const router = useRouter();

const markdownsStore = useMarkdownsStore();

const folderTreeStore = useFolderTreeStore();

const treeNodes = ref<FolderTreeNode[]>([]);

const treeRef = ref<QTree>();

const dialogRef = ref<InstanceType<typeof NewFileDialog> | null>(null);

const expandedKeys = ref<string[]>([]);

const selectedNodeKey = ref('');

const markedKey = ref<string>();

const movedAction = ref<MoveAction>('none');

const selectedNode = computed(
  (): FolderTreeNode | null => treeRef.value?.getNodeByKey(selectedNodeKey.value),
);

const folderView = ref<FolderView>({
  name: '',
  content: [],
  userId: '',
});

const trashBinView = ref<TrashBin>({
  name: '',
  content: [],
  userId: '',
});

const props = defineProps<{
  id: string,
}>();

watch(() => props.id, (newValue) => {
  selectedNodeKey.value = newValue;
});

onBeforeMount(() => {
  selectedNodeKey.value = props.id;
});

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

function expandNode(key: string) {
  if (!expandedKeys.value.find((expandedKey) => expandedKey === key)) {
    expandedKeys.value.push(key);
  }
}

function updateBreadcrumbs(node: FolderTreeNode) {
  const parents = allParents(node);
  folderTreeStore.selectedNodeParents = parents.reverse();
  folderTreeStore.selectedNodeParents.forEach(
    (p) => expandNode(p.id),
  );
}

watch(selectedNodeKey, (newValue) => {
  router.push(`/workspace/${newValue}`);
});

watch(() => selectedNode.value, (newValue, oldValue) => {
  if (oldValue === null && newValue === null) {
    router.push('/workspace');
    return;
  }
  if (newValue) {
    updateBreadcrumbs(newValue);
  }
}, {
  deep: true,
});

/**
 * Add new folder item and markdown file
 * @param itemName File name
 * @param type File type
 * @param node Target node
 * @param defaultContent Default markdown content if necessary
 * @returns Id of markdown file
 */
async function addNewItem(
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
  expandNode(node.id);
  // Update folder view
  if (node.ref) {
    node.ref.children.push(newItem);
  } else {
    folderView.value.content.push(newItem);
  }
  const newContent = defaultContent ?? `# ${itemName}`;
  // Set markdown document
  await setMarkdown({
    content: newContent,
    userId: folderView.value.userId,
    isDeleted: false,
    createAt: new Timestamp(0, 0),
    updateAt: new Timestamp(0, 0),
  }, id);
  return id;
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
      const newFileId = await addNewItem(folderName, type, node);
      router.push(`/workspace/${newFileId}`);
      dialogRef.value?.closeDialog();
    });
    dialogRef.value.promptDialog();
  }
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

function markAllChildrenFileAsDelete(children: FolderItem[] | undefined) {
  children?.forEach(async (child) => {
    await updateDelete(true, child.id);
    markAllChildrenFileAsDelete(child.children);
  });
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
  trashBinView.value.content.push(node.ref);
  // Get children of parent folder item
  const targetChildren = parentNode.id
    ? parentNode.ref?.children
    : folderView.value.content;
  markAllChildrenFileAsDelete(targetChildren);
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
  router.push(`/workspace/${parentNode.id}`);
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
  const markedNode: FolderTreeNode | undefined = treeRef
    .value?.getNodeByKey(markedKey.value);
  if (markedNode) {
    markedNode.marked = false;
    markedKey.value = undefined;
    movedAction.value = 'none';
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

function cutAndPaste(
  targetNode: FolderTreeNode,
  parentNode: FolderTreeNode,
  markedNode: FolderTreeNode,
  newNodeName: string,
) {
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
  if (targetNode.ref) {
    targetNode.ref.children.push(removedFolderItem);
  } else {
    folderView.value.content.push(removedFolderItem);
  }
  // Move marked node to new node
  if (targetNode.children) {
    targetNode.children.push(markedNode);
  } else {
    targetNode.children = [markedNode];
  }
  markedNode.parent = targetNode;
}

function pasteFromCut(node: FolderTreeNode) {
  const itemNames = node.children
    ? node.children.map((child) => child.label ?? '')
    : [];
  const markedNode: FolderTreeNode | undefined = treeRef
    .value?.getNodeByKey(markedKey.value);
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
    cutAndPaste(node, parentNode, markedNode, newNodeName);
  } else {
    $q.notify({
      type: 'error',
      message: `${i18n.t('unknownError')}. Canot find parnet of marked node`,
    });
  }
}

async function pasteFromCopy(node: FolderTreeNode) {
  const itemNames = node.children
    ? node.children.map((child) => child.label ?? '')
    : [];
  const markedNode: FolderTreeNode | undefined = treeRef
    .value?.getNodeByKey(markedKey.value);
  if (!markedNode || !markedKey.value) {
    return;
  }
  const markedNodeName = markedNode.label ?? '';
  // Get a valid name if duplicate found
  const newNodeName = itemNames.find((item) => item === markedNodeName)
    ? getValidName(itemNames, markedNodeName, 1)
    : markedNodeName;
  const parentNode = markedNode.parent;
  if (parentNode) {
    const repo = markdownsStore.targetRepo(markedKey.value);
    const mdContent = !repo
      ? await getMarkdown(markedKey.value)
        .then((md) => md?.content)
      : repo.source.content;
    await addNewItem(newNodeName, 'article', node, mdContent);
  } else {
    $q.notify({
      type: 'error',
      message: `${i18n.t('unknownError')}. Canot find parnet of marked node`,
    });
  }
}

async function onPasteClicked(node: FolderTreeNode) {
  if (movedAction.value === 'cut') {
    pasteFromCut(node);
  } else if (movedAction.value === 'copy') {
    await pasteFromCopy(node);
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
  const markedNode: FolderTreeNode | undefined = treeRef
    .value?.getNodeByKey(markedKey.value);
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

function updateEditState(nodes: FolderTreeNode[], ids: string[]) {
  nodes.forEach((node) => {
    node.edited = !!ids.find((id) => id === node.id);
    if (node.children) {
      updateEditState(node.children as FolderTreeNode[], ids);
    }
  });
}

/**
 * Update folder tree node edit state when unsavedIds changed
 */
watch(() => markdownsStore.unsavedIds, () => {
  updateEditState(treeNodes.value, markdownsStore.unsavedIds);
});

function unsavedWarning(event: BeforeUnloadEvent) {
  if (markdownsStore.hasUnsaved) {
    event.preventDefault();
    const message = 'You have unsaved changes. Are you sure you wish to leave?';
    event.returnValue = message;
    return message;
  }
  return '';
}

/**
 * Pop warning on leave if there is any unsaved file
 */
watch(() => markdownsStore.hasUnsaved, (newValue) => {
  if (process.env.MODE === 'electron') {
    window.windowApi.setUnsaveState(newValue);
  } else if (newValue) {
    window.addEventListener('beforeunload', unsavedWarning);
  } else {
    window.removeEventListener('beforeunload', unsavedWarning);
  }
});

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

function folderViewInit(initView: FolderView) {
  folderView.value = initView;
  const rootNode: FolderTreeNode = {
    label: initView.name,
    icon: 'home',
    id: '',
    type: 'article',
    children: toFolderTreeNodes(initView.content),
  };
  rootNode.children?.forEach((child) => {
    child.parent = rootNode;
  });
  treeNodes.value = [rootNode];
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
      folderViewInit(markdownFolderView);
    } else {
      await setDefaultFolderView(user.uid);
      reload = true;
    }
    const trashBinDoc = await getTrashBin(user.uid);
    if (trashBinDoc) {
      trashBinView.value = trashBinDoc;
    } else {
      await setDefaultTrashBin(user.uid);
      reload = true;
    }
    if (reload) {
      window.location.reload();
    }
    updateEditState(treeNodes.value, markdownsStore.unsavedIds);
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
watch(trashBinView, async (newValue, oldValue) => {
  if (oldValue.name) {
    await setTrashBin(newValue);
  }
}, {
  deep: true,
});
</script>

<style lang="sass" scoped>
.filter-marked
  filter: opacity(50%)
</style>
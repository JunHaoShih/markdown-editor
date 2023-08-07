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
      :nodes="folderTreeStore.folderTreeNodes"
      node-key="id"
      v-model:selected="folderTreeStore.selectedNodeKey"
      v-model:expanded="folderTreeStore.expandedKeys"
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
import { useI18n } from 'vue-i18n';
import { computed, ref, watch } from 'vue';
import { QTree, QTreeNode, useQuasar } from 'quasar';
import { auth } from 'src/boot/firebase';
import { getMarkdown } from 'src/modules/markdown/services/markdownService';
import { setDefaultFolderView } from 'src/modules/folderViews/services/folderViewService';
import { useMarkdownsStore } from 'src/modules/markdown/stores/markdownsStore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  onBeforeRouteUpdate, useRoute, useRouter,
} from 'vue-router';
import { FolderItemType, FolderItem } from '../models/folderView';
import { getMarkdownFolderView, setFolderView } from '../services/folderViewService';
import NewFileDialog from './NewFileDialog.vue';
import { useFolderTreeStore } from '../stores/folderTreeStore';
import { getTrashBin, setDefaultTrashBin, setTrashBin } from '../services/trashBinService';

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

const route = useRoute();

const folderTreeStore = useFolderTreeStore();

const markdownsStore = useMarkdownsStore();

const dialogRef = ref<InstanceType<typeof NewFileDialog> | null>(null);

const treeRef = ref<QTree>();

const selectedNode = computed(
  (): FolderTreeNode | null => treeRef.value?.getNodeByKey(folderTreeStore.selectedNodeKey),
);

function setupDialog(title: string, type: FolderItemType, node: FolderTreeNode) {
  // Get children item names in order to check if filename already exist
  const itemNames = node.ref
    ? node.ref.children.map((item) => item.name)
    : folderTreeStore.folderView.content.map((item) => item.name);
  if (dialogRef.value) {
    dialogRef.value.setTitle(title);
    dialogRef.value.setFileNames(itemNames);
    dialogRef.value.setFileName('');
    dialogRef.value.onConfirm(async (folderName) => {
      const newFileId = folderTreeStore.addNewItem(folderName, type, node);
      router.push(`/${newFileId}`);
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
  folderTreeStore.trashBin.content.push(node.ref);
  // Get children of parent folder item
  const targetChildren = parentNode.id
    ? parentNode.ref?.children
    : folderTreeStore.folderView.content;
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
  const markedNode: FolderTreeNode | undefined = treeRef
    .value?.getNodeByKey(folderTreeStore.markedKey);
  if (markedNode) {
    markedNode.marked = false;
    folderTreeStore.markedKey = undefined;
    folderTreeStore.movedAction = 'none';
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
  folderTreeStore.markedKey = node.id;
  folderTreeStore.movedAction = 'cut';
}

function onCopyClicked(node: FolderTreeNode) {
  cancelMarked();
  // We don't need to mark the node on copy, so just set markedKey
  folderTreeStore.markedKey = node.id;
  folderTreeStore.movedAction = 'copy';
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

function pasteFromCut(node: FolderTreeNode) {
  const itemNames = node.children
    ? node.children.map((child) => child.label ?? '')
    : [];
  const markedNode: FolderTreeNode | undefined = treeRef
    .value?.getNodeByKey(folderTreeStore.markedKey);
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
    folderTreeStore.cutAndPaste(node, parentNode, markedNode, newNodeName);
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
    .value?.getNodeByKey(folderTreeStore.markedKey);
  if (!markedNode || !folderTreeStore.markedKey) {
    return;
  }
  const markedNodeName = markedNode.label ?? '';
  // Get a valid name if duplicate found
  const newNodeName = itemNames.find((item) => item === markedNodeName)
    ? getValidName(itemNames, markedNodeName, 1)
    : markedNodeName;
  const parentNode = markedNode.parent;
  if (parentNode) {
    const repo = markdownsStore.targetRepo(folderTreeStore.markedKey);
    const mdContent = !repo
      ? await getMarkdown(folderTreeStore.markedKey)
        .then((md) => md?.content)
      : repo.source.content;
    await folderTreeStore.addNewItem(newNodeName, 'article', node, mdContent);
  } else {
    $q.notify({
      type: 'error',
      message: `${i18n.t('unknownError')}. Canot find parnet of marked node`,
    });
  }
}

async function onPasteClicked(node: FolderTreeNode) {
  if (folderTreeStore.movedAction === 'cut') {
    pasteFromCut(node);
  } else if (folderTreeStore.movedAction === 'copy') {
    await pasteFromCopy(node);
  }
  // We should always update breadcrumb on paste to prevent breadcrumb desync
  if (selectedNode.value) {
    folderTreeStore.updateBreadcrumbs(selectedNode.value);
  }
  folderTreeStore.expandNode(node.id);
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
    .value?.getNodeByKey(folderTreeStore.markedKey);
  if (markedNode && folderTreeStore.movedAction === 'cut') {
    if (markedNode.parent?.id === node.id) {
      return false;
    }
    const childrenIds = getChildrenIds(markedNode);
    // Target node cannot be one of marked node and its children
    return !childrenIds.find((childId) => childId === node.id);
  }
  if (markedNode && folderTreeStore.movedAction === 'copy') {
    return true;
  }
  return false;
}

/**
 * Initialize folder tree on user authed
 */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    /**
     * End initialize if store has data
     */
    if (folderTreeStore.folderView.userId) {
      return;
    }
    // Use userId to get folder view
    let reload = false;
    const markdownFolderView = await getMarkdownFolderView(user.uid);
    if (markdownFolderView) {
      folderTreeStore.folderViewInit(markdownFolderView, route.path);
    } else {
      await setDefaultFolderView(user.uid);
      reload = true;
    }
    const trashBinDoc = await getTrashBin(user.uid);
    if (trashBinDoc) {
      folderTreeStore.trashBinInit(trashBinDoc);
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
watch(() => folderTreeStore.folderView, async (newValue, oldValue) => {
  if (oldValue.name) {
    await setFolderView(newValue);
  }
}, {
  deep: true,
});

/**
 * Update trash bin to Firestore on value changed
 */
watch(() => folderTreeStore.trashBin, async (newValue, oldValue) => {
  if (oldValue.name) {
    await setTrashBin(newValue);
  }
}, {
  deep: true,
});

/**
 * Update all paremt nodes(for breadcrumbs) and push route on selected node change
 */
watch(() => folderTreeStore.selectedNodeKey, (newValue) => {
  const targetNode = treeRef.value?.getNodeByKey(newValue);
  if (!targetNode) {
    router.push('/');
    return;
  }
  folderTreeStore.updateBreadcrumbs(targetNode);
  router.push(`/${newValue}`);
});

/**
 * Update folder tree node edit state when unsavedIds changed
 */
watch(() => markdownsStore.unsavedIds, () => {
  folderTreeStore.updateEditState(folderTreeStore.folderTreeNodes, markdownsStore.unsavedIds);
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
  if (process.env.MODE === 'electron') {
    window.windowApi.setUnsaveState(newValue);
  } else if (newValue) {
    window.addEventListener('beforeunload', unsavedWarning);
  } else {
    window.removeEventListener('beforeunload', unsavedWarning);
  }
});

/**
 * Initialize selected node on route update
 */
onBeforeRouteUpdate((to) => {
  folderTreeStore.selectedNodeKeyInit(to.path);
});
</script>

<style lang="sass" scoped>
.filter-marked
  filter: opacity(50%)
</style>

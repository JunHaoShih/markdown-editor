<template>
  <div>
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
        <div class="row items-center">
          <q-icon :name="prop.node.icon" class="q-mr-sm"></q-icon>
          <div>{{ prop.node.label }}</div>
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
                <div
                  v-if="(prop.node as FolderTreeNode).id"
                >
                  <q-icon name="edit" color="primary"/>
                  {{ $t('actions.rename') }}
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
import { QTree, QTreeNode } from 'quasar';
import { v4 as uuidv4 } from 'uuid';
import { auth } from 'src/boot/firebase';
import { setMarkdown } from 'src/modules/markdown/services/markdownService';
import { setDefaultFolderView } from 'src/modules/folderViews/services/folderViewService';
import { onAuthStateChanged } from 'firebase/auth';
import {
  onBeforeRouteUpdate, useRoute, useRouter,
} from 'vue-router';
import { FolderItemType, FolderView, FolderItem } from '../models/folderView';
import { getMarkdownFolderView, setFolderView } from '../services/folderViewService';
import NewFileDialog from './NewFileDialog.vue';
import { useFolderTreeStore } from '../stores/folderTreeStore';

export interface FolderTreeNode extends QTreeNode {
  id: string,
  type: FolderItemType,
  ref?: FolderItem,
  parent?: FolderTreeNode | null,
}

const i18n = useI18n();

const router = useRouter();

const route = useRoute();

const folderTreeStore = useFolderTreeStore();

const dialogRef = ref<InstanceType<typeof NewFileDialog> | null>(null);

const treeRef = ref<QTree>();

const expandedKeys = ref<string[]>([]);

const folderView = ref<FolderView>({
  name: '',
  content: [],
  userId: '',
});

const selectedNodeKey = ref('');

const selectedNode = computed(
  (): FolderTreeNode => treeRef.value?.getNodeByKey(selectedNodeKey.value),
);

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

const folderTreeNodes = ref<FolderTreeNode[]>([]);

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
    dialogRef.value.onConfirm(async (folderName) => {
      await addNewItem(folderName, type, node);
      dialogRef.value?.closeDialog();
    });
    dialogRef.value.promptDialog();
  }
}

function addFile() {
  setupDialog(i18n.t('folderViews.addFile'), 'article', selectedNode.value);
}

function addFileByRightClick(node: FolderTreeNode) {
  setupDialog(i18n.t('folderViews.addFile'), 'article', node);
}

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
    }
  }
});

watch(folderView, async (newValue, oldValue) => {
  if (oldValue.name) {
    await setFolderView(newValue);
  }
}, {
  deep: true,
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

watch(selectedNode, (newValue, oldValue) => {
  const parents = allParents(newValue);
  folderTreeStore.selectedNodeParents = parents.reverse();
  folderTreeStore.selectedNodeParents.forEach((p) => expandedKeys.value.push(p.id));
  if (!oldValue) {
    return;
  }
  if (newValue) {
    router.push(`/${newValue.id}`);
  }
});

onBeforeRouteUpdate((to) => {
  selectedNodeKeyInit(to.path);
});
</script>

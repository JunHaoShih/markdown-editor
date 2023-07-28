<template>
  <div>
    <q-btn
      icon="create_new_folder"
      class="action-btn q-pa-sm"
      @click="addFolder"
      :disable="disableCreate"
    ></q-btn>
    <q-btn
      icon="description"
      class="action-btn q-pa-sm"
      @click="addFile"
      :disable="disableCreate"
    ></q-btn>
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
      default-expand-all
    ></q-tree>
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
import { onAuthStateChanged } from 'firebase/auth';
import { FolderItemType, FolderView, FolderItem } from '../models/folderView';
import { getMarkdownFolderView, setFolderView } from '../services/folderViewService';
import NewFileDialog from './NewFileDialog.vue';

export interface FolderTreeNode extends QTreeNode {
  id: string,
  type: FolderItemType,
  ref?: FolderItem,
}

const i18n = useI18n();

const dialogRef = ref<InstanceType<typeof NewFileDialog> | null>(null);

const treeRef = ref<QTree>();

const expandedKeys = ref<string[]>([]);

const folderView = ref<FolderView>({
  name: '',
  content: [],
  userId: '',
});

const props = defineProps<{
  modelValue: string,
}>();

type Emit = {
  (e: 'update:modelValue', value: string): void,
  (e: 'onSelectedNodeUpdate', value: FolderTreeNode): void,
}
const emit = defineEmits<Emit>();

const selectedNodeKey = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const selectedNode = computed(
  (): FolderTreeNode => treeRef.value?.getNodeByKey(selectedNodeKey.value),
);

const disableCreate = computed(
  () => selectedNode.value?.type === 'item',
);

function toFolderTreeNodes(folderItems: FolderItem[]): FolderTreeNode[] {
  const children = folderItems.map((item):FolderTreeNode => ({
    label: item.name,
    icon: item.type === 'folder' ? 'folder' : 'article',
    id: item.id,
    type: item.type,
    ref: item,
    children: toFolderTreeNodes(item.children),
  }));
  return children;
}

const folderTreeNodes = ref<FolderTreeNode[]>([]);

/**
 * Add new item to folder view and update tree
 * @param itemName Item name
 * @param type Item type
 */
async function addNewItem(itemName: string, type: FolderItemType) {
  const id = uuidv4();
  // Create new folder item
  const newItem: FolderItem = {
    id,
    name: itemName,
    type,
    children: [],
  };
  // Add new tree node and set reference
  selectedNode.value.children?.push({
    label: itemName,
    icon: type === 'folder' ? 'folder' : 'article',
    id,
    type,
    ref: newItem,
    children: [],
  });
  // We expand folder node here so user don't need to expand again
  treeRef.value?.setExpanded(selectedNode.value.id, true);
  // Update folder view
  if (selectedNode.value.ref) {
    selectedNode.value.ref.children.push(newItem);
  } else {
    folderView.value.content.push(newItem);
  }
  // Set markdown document
  if (type === 'item') {
    await setMarkdown({
      content: 'Hello',
      userId: folderView.value.userId,
    }, id);
  }
}

function setupDialog(title: string, type: FolderItemType) {
  // Get children item names in order to check if filename already exist
  const itemNames = selectedNode.value.ref
    ? selectedNode.value.ref.children.map((item) => item.name)
    : folderView.value.content.map((item) => item.name);
  if (dialogRef.value) {
    dialogRef.value.setTitle(title);
    dialogRef.value.setFileNames(itemNames);
    dialogRef.value.onConfirm(async (folderName) => {
      await addNewItem(folderName, type);
      dialogRef.value?.closeDialog();
    });
    dialogRef.value.promptDialog();
  }
}

function addFolder() {
  setupDialog(i18n.t('folderViews.addFolder'), 'folder');
}

function addFile() {
  setupDialog(i18n.t('folderViews.addFile'), 'item');
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Use userId to get folder view
    const markdownFolderView = await getMarkdownFolderView(user.uid);
    if (markdownFolderView) {
      folderView.value = markdownFolderView;
      folderTreeNodes.value = [
        {
          label: folderView.value.name,
          icon: 'circle',
          id: '',
          type: 'folder',
          children: toFolderTreeNodes(folderView.value.content),
        },
      ];
      expandedKeys.value.push('');
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

watch(selectedNode, (newValue) => {
  if (newValue) {
    emit('onSelectedNodeUpdate', newValue);
  }
});
</script>

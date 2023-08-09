<template>
  <div>
    <q-table
      :title="$t('trashBinPage.trashBin')"
      :rows="trashBinView.content"
      :columns="defaultColumns"
      :pagination="pagination"
      class="main-panel sticky-header-table "
      table-class="outer-max"
      dense
    >
      <!-- action buttons -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            dense
            round
            flat
            color="grey"
            icon="undo"
            size="sm"
            @click="onUndoClicked(props.row)"
          >
            <q-tooltip>
              {{ $t('actions.undo') }}
            </q-tooltip>
          </q-btn>
          <q-btn
            dense
            round
            flat
            color="grey"
            icon="delete"
            size="sm"
            @click="onDeleteClicked(props.row)"
          >
            <q-tooltip>
              {{ $t('actions.delete') }}
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>
      <!-- is checkout -->
      <template v-slot:body-cell-icon="props">
        <q-td :props="props">
          <q-icon :name="(props.row as FolderItem).type" />
        </q-td>
      </template>
      <!-- create date -->
      <template v-slot:body-cell-createAt="props">
        <q-td :props="props">
          {{ getDateStr(getMatchedMarkdown((props.row as FolderItem).id)?.createAt.toDate()) }}
          <q-tooltip>
            {{ getMatchedMarkdown((props.row as FolderItem).id)?.createAt.toDate().toString() }}
          </q-tooltip>
        </q-td>
      </template>
      <!-- update date -->
      <template v-slot:body-cell-updateAt="props">
        <q-td :props="props">
          {{ getDateStr(getMatchedMarkdown((props.row as FolderItem).id)?.updateAt.toDate()) }}
          <q-tooltip>
            {{ getMatchedMarkdown((props.row as FolderItem).id)?.updateAt.toDate().toString() }}
          </q-tooltip>
        </q-td>
      </template>
      <!-- delete date -->
      <template v-slot:body-cell-deleteAt="props">
        <q-td :props="props">
          {{ getDateStr(getMatchedMarkdown((props.row as FolderItem).id)?.deleteAt?.toDate()) }}
          <q-tooltip>
            {{ getMatchedMarkdown((props.row as FolderItem).id)?.deleteAt?.toDate().toString() }}
          </q-tooltip>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { aw } from 'app/dist/electron/UnPackaged/assets/index.b1584e8e';
import { onAuthStateChanged } from 'firebase/auth';
import { QuerySnapshot } from 'firebase/firestore';
import { QTableProps, useQuasar } from 'quasar';
import { auth } from 'src/boot/firebase';
import { FolderItem, FolderView } from 'src/modules/folderViews/models/folderView';
import { TrashBin } from 'src/modules/folderViews/models/trashBin';
import { getMarkdownFolderView, setDefaultFolderView, setFolderView } from 'src/modules/folderViews/services/folderViewService';
import { getTrashBin, setDefaultTrashBin, setTrashBin } from 'src/modules/folderViews/services/trashBinService';
import { Markdown } from 'src/modules/markdown/models/markdown';
import { getDeletedMarkdowns } from 'src/modules/markdown/services/markdownService';
import { getValidName } from 'src/services/fileNameService';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const $q = useQuasar();

const i18n = useI18n();

const router = useRouter();

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

const deletedMarkdowns = ref<QuerySnapshot<Markdown, Markdown>>();

function onUndoClicked(folderItem: FolderItem) {
  $q.dialog({
    dark: true,
    title: i18n.t('actions.undo'),
    message: i18n.t('trashBinPage.moveToWorkspaceRoot'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const index = trashBinView.value.content.findIndex((child) => child.id === folderItem.id);
    const removedFolderItem = trashBinView.value.content.splice(index, 1)[0];
    const itemNames = folderView.value.content.map((child) => child.name);
    const newName = getValidName(itemNames, removedFolderItem.name);
    removedFolderItem.name = newName;
    folderView.value.content.push(removedFolderItem);
    await setFolderView(folderView.value);
    await setTrashBin(trashBinView.value);
  });
}

function onDeleteClicked(folderItem: FolderItem) {
  // TODO implement delete machanics
}

function getMatchedMarkdown(fileId: string) {
  return deletedMarkdowns.value?.docs
    .find((docRef) => docRef.id === fileId)
    ?.data();
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const markdownFolderView = await getMarkdownFolderView(user.uid);
    if (markdownFolderView) {
      folderView.value = markdownFolderView;
    } else {
      await setDefaultFolderView(user.uid);
    }
    const trashBinDoc = await getTrashBin(user.uid);
    if (trashBinDoc) {
      trashBinView.value = trashBinDoc;
    } else {
      await setDefaultTrashBin(user.uid);
    }
    deletedMarkdowns.value = await getDeletedMarkdowns(user.uid);
  } else {
    router.push('/login');
  }
});

const pagination = ref<QTableProps['pagination']>({
  rowsPerPage: 50,
});

const defaultColumns = computed(
  (): QTableProps['columns'] => [
    {
      name: 'actions', label: i18n.t('action'), field: '', align: 'center', style: 'width: 60px',
    },
    {
      name: 'icon', label: '', field: '', align: 'left', sortable: true,
    },
    {
      name: 'name', label: i18n.t('folderItems.name'), field: 'name', align: 'left', sortable: true,
    },
    {
      name: 'createAt', label: i18n.t('base.createAt'), field: '', align: 'left', sortable: true,
    },
    {
      name: 'updateAt', label: i18n.t('base.updateAt'), field: '', align: 'left', sortable: true,
    },
    {
      name: 'deleteAt', label: i18n.t('base.deleteAt'), field: '', align: 'left', sortable: true,
    },
  ],
);

function getDateStr(date?: Date): string {
  if (!date) {
    return '';
  }
  const dateStr = new Date(date).toISOString().split('T')[0];
  return dateStr;
}
</script>

<style lang="sass" scoped>
:deep(.outer-max)
  height: calc( 100vh - 130px )
</style>

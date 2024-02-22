<template>
  <div class="q-pa-sm">
    <BreadCrumbs
      :breadcrumbs="breadcrumbs"
    />
    <q-separator
      :color="darkStore.isDark ? 'grey-4' : 'grey-10'"
      class="q-my-sm"
    />
    <div class="q-gutter-sm row tw-hidden sm:tw-flex">
      <q-btn
        :disable="mdSource.content === mdEdit"
        icon="save"
        class="action-btn q-pa-sm"
        :loading="saving"
        @click="onSaveClicked"
      >
        <q-tooltip>
          {{ $t('markdownPage.save') }}
        </q-tooltip>
      </q-btn>
      <q-btn
        :disable="mdSource.content === mdEdit"
        icon="cancel"
        class="action-btn q-pa-sm"
        text-color="red"
        :loading="saving"
        @click="onDiscardClicked"
      >
        <q-tooltip>
          {{ $t('markdownPage.discardChange') }}
        </q-tooltip>
      </q-btn>
      <q-btn
        icon="download"
        class="action-btn q-pa-sm"
        text-color="primary"
        :loading="saving"
        @click="onDownload"
      >
        <q-tooltip>
          {{ $t('markdownPage.download') }}
        </q-tooltip>
      </q-btn>
      <q-space/>
      <q-btn
        icon="edit"
        class="action-btn q-pa-sm"
        @click="editorType = 'edit'"
      ></q-btn>
      <q-btn
        icon="horizontal_distribute"
        class="action-btn q-pa-sm"
        @click="editorType = 'split'"
      ></q-btn>
      <q-btn
        icon="visibility"
        class="action-btn q-pa-sm"
        @click="editorType = 'view'"
      ></q-btn>
    </div>
    <MarkdownEditor
      v-for="repo in markdownsStore.repos" :key="repo.id"
      ref="editors"
      :style="repo.id === id ? '' : 'display: none'"
      v-model="repo.edit"
      :hide-viewer="repo.id !== id"
      :type="editorType"
      :is-dark="darkStore.isDark"
      splitter-class="tw-h-[calc(100vh-115px)] sm:tw-h-[calc(100vh-155px)]"
      @on-splitter-resize="editorType = 'none'"
    >
    </MarkdownEditor>
    <q-fab
      v-model="fabDisplay"
      icon="keyboard_arrow_up"
      direction="up"
      :class="`tw-fixed tw-end-6 tw-bottom-6 tw-group tw-bg-fuchsia-700 tw-text-stone-200
      hover:tw-opacity-100
      ${fabDisplay ? 'tw-opacity-100' : 'tw-opacity-50'}`"
    >
        <q-fab-action
          :disable="mdSource.content === mdEdit"
          class="tw-bg-primary-600 tw-text-stone-200"
          icon="save"
          @click="onSaveClicked"
        >
          <q-tooltip>
            {{ $t('markdownPage.save') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          :disable="mdSource.content === mdEdit"
          class="tw-bg-red-600 tw-text-stone-200"
          icon="cancel"
          @click="onDiscardClicked"
        >
          <q-tooltip>
            {{ $t('markdownPage.discardChange') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          class="tw-bg-primary-600 tw-text-stone-200"
          icon="download"
          @click="onDownload"
        >
          <q-tooltip>
            {{ $t('markdownPage.download') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          class="tw-bg-primary-600 tw-text-stone-200"
          icon="edit"
          @click="editorType = 'edit'"
        />
        <q-fab-action
          class="tw-bg-primary-600 tw-text-stone-200 tw-hidden sm:tw-block"
          icon="horizontal_distribute"
          @click="editorType = 'split'"
        />
        <q-fab-action
          class="tw-bg-primary-600 tw-text-stone-200"
          icon="visibility"
          @click="editorType = 'view'"
        />
      </q-fab>
  </div>
</template>

<script setup lang="ts">
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import MarkdownEditor, { EditorType } from 'src/modules/markdown/components/MarkdownEditor.vue';
import { useFolderTreeStore } from 'src/modules/folderViews/stores/folderTreeStore';
import {
  computed, onBeforeMount, ref, watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { getMarkdown, setMarkdown } from 'src/modules/markdown/services/markdownService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from 'src/boot/firebase';
import { useAuthStore } from 'src/modules/firebase/stores/authStore';
import { useMarkdownsStore } from 'src/modules/markdown/stores/markdownsStore';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { Markdown } from 'src/modules/markdown/models/markdown';
import { Timestamp } from '@firebase/firestore';
import { useDarkStore } from 'src/stores/darkModeStore';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { getValidName } from 'src/services/fileNameService';
import { LocalNotifications } from '@capacitor/local-notifications';

const $q = useQuasar();

const i18n = useI18n();

const router = useRouter();

const markdownsStore = useMarkdownsStore();

const folderTreeStore = useFolderTreeStore();

const breadcrumbs = computed(
  () => folderTreeStore.breadCrumbs.map((breadcrumb) => ({
    icon: breadcrumb.icon,
    label: breadcrumb.label,
    to: breadcrumb.id === 'workspace-root'
      ? '/workspace'
      : `/workspace/${breadcrumb.id}`,
  })),
);

const authStore = useAuthStore();

const darkStore = useDarkStore();

const editors = ref<InstanceType<typeof MarkdownEditor>[]>();

const editorType = ref<EditorType>('split');

const fabDisplay = ref(false);

const props = defineProps<{
  id: string,
}>();

const mdSource = computed({
  get: (): Markdown => markdownsStore.targetRepo(props.id)?.source ?? {
    content: '',
    userId: '',
    isDeleted: false,
    createAt: new Timestamp(0, 0),
    updateAt: new Timestamp(0, 0),
  },
  set: (value) => markdownsStore.save(value, props.id),
});

const mdEdit = computed({
  get: () => markdownsStore.targetRepo(props.id)?.edit ?? '',
  set: (value) => markdownsStore.updateEdit(value, props.id),
});

const saving = ref(false);

async function markdownInit(itemId: string) {
  if (!markdownsStore.targetRepo(itemId)) {
    const md = await getMarkdown(itemId);
    if (!md) {
      router.push('/');
      return;
    }
    markdownsStore.insert(md, itemId);
  }
}

async function saveMarkdown() {
  if (mdSource.value.content !== mdEdit.value) {
    mdSource.value.content = mdEdit.value;
    await setMarkdown(mdSource.value, props.id);
  }
}

async function onSaveClicked() {
  saving.value = true;
  await saveMarkdown();
  saving.value = false;
}

async function onDiscardClicked() {
  $q.dialog({
    dark: true,
    title: i18n.t('markdownPage.discardChange'),
    message: i18n.t('markdownPage.confirmDiscard'),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    mdEdit.value = mdSource.value.content;
  });
}

const mdChannelId = 'markdown-editor';

async function capacitorNotify(mdName: string) {
  await LocalNotifications.createChannel({
    id: mdChannelId,
    name: 'Markdown Editor',
  });
  const { notifications } = await LocalNotifications.getDeliveredNotifications();
  const ids = notifications.length > 0
    ? notifications
      .filter((notification) => notification.group !== 'ranker_group')
      .map((notification) => notification.id)
    : [0];

  const nextId = Math.max(...ids) + 1;

  LocalNotifications.schedule({
    notifications: [
      {
        id: nextId,
        title: `${mdName}`,
        body: `${i18n.t('markdownPage.downloadComplete')}`,
        channelId: mdChannelId,
      },
    ],
  });
}

async function downloadByCapacitor() {
  const folderName = 'markdown-editor';
  const readdirResult = await Filesystem.readdir({
    path: '',
    directory: Directory.Documents,
  });

  if (!readdirResult.files.find((file) => file.type === 'directory' && file.name === folderName)) {
    await Filesystem.mkdir({
      path: folderName,
      directory: Directory.Documents,
      recursive: true,
    });
  }

  const readdirMdResult = await Filesystem.readdir({
    path: folderName,
    directory: Directory.Documents,
  });

  const fileNames = readdirMdResult.files.map((file) => {
    const lastIndex = file.name.lastIndexOf('.');
    if (lastIndex === -1) {
      return file.name;
    }
    return file.name.substring(0, lastIndex);
  });
  const newName = getValidName(fileNames, folderTreeStore.fileName ?? 'unknown');

  const mdName = `${newName}.md`;
  const mdFullPath = `${folderName}/${mdName}`;
  Filesystem.writeFile({
    path: mdFullPath,
    data: mdSource.value.content,
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
  }).then(async () => {
    $q.notify({
      type: 'success',
      message: `${i18n.t('markdownPage.downloadComplete')} ${Directory.Documents}/${mdFullPath}`,
    });
    await capacitorNotify(mdName);
  }).catch((error) => {
    $q.notify({
      type: 'error',
      message: error,
    });
  });
}

function downloadByAnchor() {
  const blob = new Blob([mdSource.value.content], { type: 'text/plain' });
  const aRef = document.createElement('a');
  const label = folderTreeStore.fileName;
  const fileName = label ? `${label}.md` : 'temp.md';
  aRef.download = fileName;
  aRef.href = window.URL.createObjectURL(blob);
  aRef.click();
}

async function onDownload() {
  if (process.env.MODE === 'capacitor') {
    await downloadByCapacitor();
  } else {
    downloadByAnchor();
  }
}

watch(() => props.id, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    await markdownInit(newValue);
  }
});

/**
 * Decide editor type by min width<br/>
 * Please see MarkdownEditor.vue, we use sm:tw-w-6/12 on leftDiv
 */
onBeforeMount(async () => {
  await markdownInit(props.id);
  if (window.matchMedia('(min-width: 640px)').matches) {
    editorType.value = 'split';
  } else {
    editorType.value = 'view';
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    authStore.user = user;
  } else {
    router.push('/login');
  }
});

watch(() => markdownsStore.triggerFocus, (newValue) => {
  if (newValue) {
    const index = markdownsStore.repos.findIndex((repo) => repo.id === props.id);
    if (index < 0) {
      markdownsStore.triggerFocus = false;
      return;
    }
    const editor = editors.value?.at(index);
    if (!editor) {
      markdownsStore.triggerFocus = false;
      return;
    }
    markdownsStore.triggerFocus = false;
    editor.focusEditor();
  }
});
</script>

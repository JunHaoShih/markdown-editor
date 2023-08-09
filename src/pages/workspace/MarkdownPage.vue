<template>
  <div class="q-pa-sm">
    <q-breadcrumbs class="text-primary" active-color="black">
      <q-breadcrumbs-el
        v-for="breadCrumb in folderTreeStore.breadCrumbs"
        :key="breadCrumb.id"
        :label="breadCrumb.label"
        :icon="breadCrumb.icon"
        :to="`/workspace/${breadCrumb.id}`"
      />
    </q-breadcrumbs>
    <q-separator color="black" class="q-my-sm"/>
    <div class="q-gutter-sm">
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
    </div>
    <MarkdownEditor
      v-model="mdEdit">
    </MarkdownEditor>
  </div>
</template>

<script setup lang="ts">
import MarkdownEditor from 'src/modules/markdown/components/MarkdownEditor.vue';
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

const $q = useQuasar();

const i18n = useI18n();

const router = useRouter();

const markdownsStore = useMarkdownsStore();

const folderTreeStore = useFolderTreeStore();

const authStore = useAuthStore();

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
  // const itemId = getItemId(path);
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

watch(() => props.id, async (newValue) => {
  if (newValue) {
    await markdownInit(newValue);
  }
});

onBeforeMount(async () => {
  await markdownInit(props.id);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    authStore.user = user;
  } else {
    router.push('/login');
  }
});
</script>

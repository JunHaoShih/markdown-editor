<template>
  <div class="q-pa-sm">
    <q-breadcrumbs class="text-primary" active-color="black">
      <q-breadcrumbs-el
        v-for="breadCrumb in folderTreeStore.breadCrumbs"
        :key="breadCrumb.id"
        :label="breadCrumb.label"
        :icon="breadCrumb.icon"
        :to="`/${breadCrumb.id}`"
      />
    </q-breadcrumbs>
    <q-separator color="black" class="q-my-sm"/>
    <q-btn
      :disable="mdSource.content === mdEdit"
      icon="save"
      class="action-btn"
      :loading="saving"
      @click="onSaveClicked"
    ></q-btn>
    <MarkdownEditor
      v-model="mdEdit">
    </MarkdownEditor>
  </div>
</template>

<script setup lang="ts">
import MarkdownEditor from 'src/modules/markdown/components/MarkdownEditor.vue';
import { useFolderTreeStore } from 'src/modules/folderViews/stores/folderTreeStore';
import { onBeforeMount, ref } from 'vue';
import {
  onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter,
} from 'vue-router';
import { getMarkdown, setMarkdown } from 'src/modules/markdown/services/markdownService';
import { Markdown } from 'src/modules/markdown/models/markdown';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from 'src/boot/firebase';
import { useAuthStore } from 'src/modules/firebase/stores/authStore';

const route = useRoute();

const router = useRouter();

const folderTreeStore = useFolderTreeStore();

const authStore = useAuthStore();

const mdSource = ref<Markdown>({} as Markdown);

const mdEdit = ref('');

const saving = ref(false);

function getItemId(path: string) {
  const pathTokens = path.split('/');
  const itemId = pathTokens[1];
  return itemId;
}

async function markdownInit(path: string) {
  const itemId = getItemId(path);
  const md = await getMarkdown(itemId);
  if (md) {
    mdSource.value = md;
    mdEdit.value = md.content;
  } else {
    router.push('/');
  }
}

async function saveMarkdown(path: string) {
  if (mdSource.value.content !== mdEdit.value) {
    mdSource.value.content = mdEdit.value;
    const itemId = getItemId(path);
    await setMarkdown(mdSource.value, itemId);
  }
}

async function onSaveClicked() {
  saving.value = true;
  await saveMarkdown(route.path);
  saving.value = false;
}

onBeforeRouteLeave(async (_to, from) => {
  await saveMarkdown(from.path);
});

onBeforeRouteUpdate(async (to, from) => {
  await saveMarkdown(from.path);
  await markdownInit(to.path);
});

onBeforeMount(async () => {
  await markdownInit(route.path);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    authStore.user = user;
  } else {
    router.push('/login');
  }
});
</script>

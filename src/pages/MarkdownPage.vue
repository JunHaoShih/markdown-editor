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
import {
  computed, onBeforeMount, ref, watch,
} from 'vue';
import {
  useRoute, useRouter,
} from 'vue-router';
import { getMarkdown, setMarkdown } from 'src/modules/markdown/services/markdownService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from 'src/boot/firebase';
import { useAuthStore } from 'src/modules/firebase/stores/authStore';
import { useMarkdownsStore } from 'src/modules/markdown/stores/markdownsStore';

const route = useRoute();

const router = useRouter();

const markdownsStore = useMarkdownsStore();

const folderTreeStore = useFolderTreeStore();

const authStore = useAuthStore();

const props = defineProps<{
  id: string,
}>();

const mdSource = computed({
  get: () => markdownsStore.targetRepo(props.id)?.source ?? {
    content: '',
    userId: '',
  },
  set: (value) => markdownsStore.save(value, props.id),
});

const mdEdit = computed({
  get: () => markdownsStore.targetRepo(props.id)?.edit ?? '',
  set: (value) => markdownsStore.updateEdit(value, props.id),
});

const saving = ref(false);

function getItemId(path: string) {
  const pathTokens = path.split('/');
  const itemId = pathTokens[1];
  return itemId;
}

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

/* onBeforeRouteLeave(async (_to, from) => {
  if (mdSource.value.userId) {
    await saveMarkdown(from.path);
  }
}); */

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

<template>
  <div
    ref="listRef"
    tabindex="-1"
    @keydown.up="tryMoveUp"
    @keydown.down="tryMoveDown"
    @keydown.enter.prevent="toCurrentFile"
  >
    <q-list
      separator
      :dark="dark"
    >
      <q-item
        v-for="(repo, index) in markdownsStore.repos" :key="repo.id"
        clickable
        v-ripple
        dense
        @click="toFile(repo.id)"
        :class="index === travelIndex ?
          'tw-bg-stone-300 dark:tw-bg-stone-600' :
          ''"
      >
        <q-item-section avator class="tw-flex-none">
          <q-icon
            name="description"
            :color="repo.id === id ? 'primary' : 'white'"
          />
        </q-item-section>
        <q-item-section
          class="tw-text-stone-800 dark:tw-text-stone-300
            tw-flex tw-flex-row tw-my-auto tw-justify-start"
        >
          <q-icon
            v-if="markdownsStore.unsavedIds.includes(repo.id)"
            name="adjust"
            color="amber"
            class="tw-mt-1 tw-mr-2"
          ></q-icon>
          <div
            :class="repo.id === id ?
              'tw-text-primary-500' :
              'tw-text-stone-800 dark:tw-text-stone-300'"
          >
            {{ folderTreeStore.findFileName(repo.id) }}
          </div>
        </q-item-section>
        <q-item-section side>
          <q-icon
            v-if="repo.id !== id"
            name="cancel"
            class="tw-cursor-pointer tw-bg-white dark:tw-bg-stone-700 dark:tw-text-stone-300"
            @click.stop="closeFile(repo.id)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useMarkdownsStore } from 'src/modules/markdown/stores/markdownsStore';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { useFolderTreeStore } from '../stores/folderTreeStore';

const listRef = ref<HTMLElement>();

const $q = useQuasar();

const i18n = useI18n();

const router = useRouter();

const markdownsStore = useMarkdownsStore();

const folderTreeStore = useFolderTreeStore();

const travelIndex = ref(0);

withDefaults(defineProps<{
  dark?: boolean,
  id: string,
}>(), {
  dark: false,
});

function closeFile(mdId: string) {
  const index = markdownsStore.repos.findIndex((repo) => repo.id === mdId);
  if (index === -1) {
    return;
  }

  if (markdownsStore.unsavedIds.includes(mdId)) {
    $q.dialog({
      dark: true,
      title: i18n.t('markdownPage.discardChange'),
      message: i18n.t('markdownPage.confirmDiscard'),
      cancel: true,
      persistent: true,
    }).onOk(() => {
      const targetRepo = markdownsStore.repos[index];
      targetRepo.edit = targetRepo.source.content;
      markdownsStore.repos.splice(index, 1);
    });
  } else {
    markdownsStore.repos.splice(index, 1);
  }
}

function toFile(mdId: string) {
  router.push(`/workspace/${mdId}`);
}

function tryMoveUp() {
  if (travelIndex.value > 0) {
    travelIndex.value -= 1;
  }
}

function tryMoveDown() {
  if (travelIndex.value < markdownsStore.repos.length - 1) {
    travelIndex.value += 1;
  }
}

watch(() => markdownsStore.repos.length, (newValue) => {
  if (travelIndex.value > newValue - 1) {
    travelIndex.value = newValue - 1;
  }
});

function toCurrentFile() {
  const repo = markdownsStore.repos[travelIndex.value];
  if (!repo) {
    return;
  }
  toFile(repo.id);
}

function focusList() {
  setTimeout(() => {
    listRef.value?.focus();
  }, 200);
}

defineExpose({
  focusList,
});
</script>

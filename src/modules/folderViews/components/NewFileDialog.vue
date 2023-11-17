<template>
  <q-dialog
    v-model="prompt"
    persistent
    transition-show="rotate"
    transition-hide="rotate"
  >
    <q-card dark class="dark:tw-bg-stone-800 tw-w-full md:tw-w-3/5 lg:tw-w-2/4">
      <q-form @submit="submit">
        <q-card-section
          class="tw-bg-stone-900 tw-text-white tw-flex tw-flex-row tw-items-center"
        >
          <div class="tw-font-bold tw-leading-tight tw-tracking-tight tw-text-gray-300
            tw-text-xl">
            {{ title }}
          </div>
          <q-space/>
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
          />
        </q-card-section>
        <q-separator />
        <q-card-section
          class="tw-w-full"
        >
          <q-input
            v-model="inputFileName"
            autofocus
            dense
            filled
            label-color="tw-text-gray-900 dark:tw-text-stone-300"
            input-class="tw-text-gray-900 dark:tw-text-stone-300"
            class="dark:tw-bg-stone-700 tw-rounded-md"
            type="text"
            :rules="[
              val => !isFileNameDuplicated || $t('folderViews.fileNameExist'),
              val => !!inputFileName || $t('folderViews.fileNameCannotBeEmpty'),
              val => noInvalidChars || $t('folderViews.fileNameHasInvalidChars'),
              val => !exceedMaxLength || $t('folderViews.cannotLongerThan40'),
            ]"
            hide-bottom-space
          />
        </q-card-section>

        <q-separator class="dark:tw-bg-stone-400" />

        <q-card-actions
          align="right"
          class="tw-text-primary-600"
        >
          <q-btn
            flat
            :label="$t('actions.cancel')"
            v-close-popup
          />
          <q-btn
            flat
            :label="$t('actions.confirm')"
            type="submit"
            :disable="isFileNameDuplicated || !inputFileName || !noInvalidChars || exceedMaxLength"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const inputFileName = ref('');

const prompt = ref(false);

const title = ref('');

const fileNames = ref<string[]>([]);

const isFileNameDuplicated = computed(
  () => !!fileNames.value.find((fileName) => fileName === inputFileName.value),
);

const noInvalidChars = computed(
  () => /^[^\\/:*?"<>|]+$/.test(String(inputFileName.value)),
);

const exceedMaxLength = computed(
  () => inputFileName.value.length > 40,
);

interface DialogControl {
  /**
   * Show dialog
   */
  promptDialog: () => void,

  /**
   * Close dialog
   */
  closeDialog: () => void,
}

function dialogControl(): DialogControl {
  return {
    promptDialog() {
      prompt.value = true;
    },

    closeDialog() {
      prompt.value = false;
    },
  };
}

const confirmFunction = ref<(fileName: string, dialog: DialogControl) => void>();

function submit() {
  if (confirmFunction.value) {
    confirmFunction.value(inputFileName.value, dialogControl());
  }
}

interface DialogBuilder {
  /**
   * Setup filenames that is not allowed
   * @param inputFileNames Filenames that is not allowed
   */
  withFileNames: (inputFileNames: string[]) => DialogBuilder,

  /**
   * Setup dialog title
   * @param inputTitle Dialog title
   */
  withTitle: (inputTitle: string) => DialogBuilder,

  /**
   * Setup filename inside input
   * @param fileName Filename inside input
   */
  withFileName: (fileName: string) => DialogBuilder,

  /**
   * Setup callback after confirm button clicked
   * @param func Callback function on confirm clicked
   */
  onConfirm: (func: (fileName: string, dialog: DialogControl) => void) => DialogBuilder,

  /**
   * Build dialog controller
   */
  build: () => DialogControl,
}

function dialogBuilder(): DialogBuilder {
  interface DialogData {
    fileNames: string[],
    title: string,
    inputFileName: string,
    onConfirm?: (fileName: string, dialog: DialogControl) => void,
  }

  const dialogData: DialogData = {
    fileNames: [],
    title: '',
    inputFileName: '',
  };

  return {
    withFileNames(inputFileNames: string[]) {
      dialogData.fileNames = inputFileNames;
      return this;
    },

    withTitle(inputTitle: string) {
      dialogData.title = inputTitle;
      return this;
    },

    withFileName(fileName: string) {
      dialogData.inputFileName = fileName;
      return this;
    },

    onConfirm(func: (fileName: string, dialog: DialogControl) => void) {
      dialogData.onConfirm = func;
      return this;
    },

    build() {
      fileNames.value = dialogData.fileNames;
      title.value = dialogData.title;
      inputFileName.value = dialogData.inputFileName;
      confirmFunction.value = dialogData.onConfirm;
      return dialogControl();
    },
  };
}

defineExpose({
  dialogBuilder,
});
</script>

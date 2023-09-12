<template>
  <q-dialog
    v-model="prompt"
    persistent
    transition-show="rotate"
    transition-hide="rotate"
  >
    <q-card style="min-width: 700px">
      <q-form @submit="submit">
        <q-card-section
          class="bg-dark text-white row items-center"
        >
          <div class="text-h6">
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
          class="scroll dialog-inner-max"
        >
          <q-input
            v-model="inputFileName"
            autofocus
            dense
            filled
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
        <q-separator />
        <q-card-actions
          align="right"
          class="text-primary"
        >
          <q-btn flat :label="$t('actions.cancel')" v-close-popup />
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

interface DialogData {
  fileNames: string[],
  title: string,
  inputFileName: string,
  onConfirm?: (fileName: string, dialog: DialogControl) => void,
}

function dialogBuilder() {
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

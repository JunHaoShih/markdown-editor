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
            dense
            filled
            type="text"
            :rules="[
              val => isFileNameValid || $t('folderViews.fileNameExist'),
              val => !!inputFileName || $t('folderViews.fileNameCannotBeEmpty')
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
            :disable="!isFileNameValid || !inputFileName"
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

const confirmFunction = ref<(fileName: string) => void>();

const isFileNameValid = computed(
  () => !fileNames.value.find((fileName) => fileName === inputFileName.value),
);

function submit() {
  if (confirmFunction.value) {
    confirmFunction.value(inputFileName.value);
  }
}

function setFileNames(inputFileNames: string[]) {
  fileNames.value = inputFileNames;
}

function setTitle(inputTitle: string) {
  title.value = inputTitle;
}

function promptDialog() {
  inputFileName.value = '';
  prompt.value = true;
}

function closeDialog() {
  prompt.value = false;
}

function onConfirm(func: (fileName: string) => void) {
  confirmFunction.value = func;
}

defineExpose({
  setFileNames,
  setTitle,
  promptDialog,
  closeDialog,
  onConfirm,
});
</script>
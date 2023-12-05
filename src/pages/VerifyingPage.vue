<template>
  <div
    class="tw-flex tw-flex-col tw-items-center tw-justify-center
    tw-px-6 tw-py-8 tw-mx-auto md:tw-h-[calc(100vh-80px)] lg:tw-py-0"
  >
    <a
      href="#"
      class="tw-flex tw-items-center tw-mb-6 tw-text-2xl tw-font-semibold
      tw-text-gray-900 dark:tw-text-stone-300"
    >
      <q-icon name="face" class="tw-text-primary-600 tw-pr-2"/>
      {{ $t('verifyingPage.title') }}
    </a>
    <div
      class="tw-w-full tw-bg-white tw-rounded-lg tw-shadow dark:tw-border md:tw-mt-0
      sm:tw-max-w-md xl:tw-p-0 dark:tw-border-gray-500"
    >
      <div class="tw-p-6 tw-space-y-4 md:tw-space-y-6 sm:tw-p-8 dark:tw-bg-stone-800 tw-rounded-lg">
        <h5
          class="tw-text-lg tw-font-bold tw-leading-tight tw-tracking-tight tw-text-gray-900
          dark:tw-text-stone-300 tw-text-center"
        >
          {{ $t('verifyingPage.checkYourEmail') }}
        </h5>
        <h5
          class="tw-text-center tw-text-2xl tw-font-extrabold tw-text-gray-600
          dark:tw-text-stone-400"
        >
          {{ authStore.user?.email }}
        </h5>
        <h5
          class="tw-text-center tw-text-base tw-font-extrabold tw-text-gray-900
          dark:tw-text-stone-300"
        >
          {{ $t('verifyingPage.howToVerify') }}
        </h5>
        <p class="tw-text-sm tw-font-light tw-text-gray-500 dark:tw-text-gray-400
        tw-text-center">
          {{ $t('verifyingPage.cannotFindEmail') }}
        </p>
        <q-btn
          :disable="counter !== 0"
          :loading="loading"
          push
          dense
          size="lg"
          class="tw-text-white tw-bg-primary-600 tw-w-full"
          @click="onSubmit"
        >
          <template v-slot:default>
            <div v-if="counter !== 0" class="tw-flex tw-flex-row">
              {{ counter }}
              <q-spinner-gears />
            </div>
            <div v-else>{{ $t('verifyingPage.resendEmail') }}</div>
          </template>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sendEmailVerification } from 'firebase/auth';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/modules/firebase/stores/authStore';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();

const i18n = useI18n();

const authStore = useAuthStore();

const counter = ref(60);

const loading = ref(false);

let intervalId: number | null = null;

function setTimer() {
  intervalId = window.setInterval(() => {
    counter.value -= 1;
    if (counter.value === 0 && intervalId) {
      clearInterval(intervalId);
    }
  }, 1000);
}

async function onSubmit() {
  if (authStore.user) {
    loading.value = true;
    await sendEmailVerification(authStore.user)
      .then(() => {
        $q.notify({
          type: 'success',
          message: i18n.t('verifyingPage.emailSentSuccess'),
        });
      })
      .catch(() => {
        $q.notify({
          type: 'errpr',
          message: i18n.t('verifyingPage.emailSentFailed'),
        });
      });
    loading.value = false;
    counter.value = 120;
    setTimer();
  }
}

onBeforeMount(() => {
  setTimer();
});
</script>

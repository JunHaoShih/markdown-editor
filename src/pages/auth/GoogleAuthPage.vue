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
      {{ $t('auth.title') }}
    </a>
    <div
      class="tw-w-full tw-bg-white tw-rounded-lg tw-shadow dark:tw-border md:tw-mt-0
      sm:tw-max-w-md xl:tw-p-0 dark:tw-border-gray-500"
    >
      <div class="tw-p-6 tw-space-y-4 md:tw-space-y-6 sm:tw-p-8 dark:tw-bg-stone-800 tw-rounded-lg">
        <GoogleLoginButton
          v-if="!complete"
          @on-success="sendCredential"
        />
        <h5
          v-else
          class="tw-text-lg tw-font-bold tw-leading-tight tw-tracking-tight tw-text-gray-900
          dark:tw-text-stone-300 tw-text-center"
        >
          {{ $t('auth.closeNow') }}
        </h5>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OAuthCredential } from 'firebase/auth';
import GoogleLoginButton from 'src/components/GoogleLoginButton.vue';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();

const router = useRouter();

const complete = ref(false);

const callbackId = computed(() => route.query.callbackId);

watch(callbackId, (newId) => {
  if (!newId) {
    router.replace('/');
  }
}, {
  immediate: true,
});

function sendCredential(credential: OAuthCredential) {
  const aRef = document.createElement('a');
  aRef.href = `markdown-editor://googleAuth?credential=${credential}&callbackId=${callbackId.value}`;
  aRef.click();
  complete.value = true;
}
</script>

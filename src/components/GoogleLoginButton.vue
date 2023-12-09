<template>
  <button
    class="tw-px-4 tw-py-2 tw-border tw-flex tw-gap-2 tw-border-slate-300 tw-w-full
    tw-items-center tw-justify-center tw-flex-row
    dark:tw-border-slate-700 tw-rounded-lg tw-text-slate-700 dark:tw-text-slate-200
    hover:tw-border-slate-400 dark:tw-hover:border-slate-500 hover:tw-text-slate-900
    dark:hover:tw-text-slate-300 hover:tw-shadow tw-transition tw-duration-150"
    @click="googleLogin"
  >
    <img class="tw-w-6 tw-h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo">
    <span>Login with Google</span>
  </button>
</template>

<script setup lang="ts">
import { OAuthCredential } from 'firebase/auth';
import { useAuthStore } from 'src/modules/firebase/stores/authStore';

const authStore = useAuthStore();

type Emit = {
  (e: 'onSuccess', credential: OAuthCredential): void
}
const emit = defineEmits<Emit>();

async function googleLogin() {
  const credential = await authStore.googleLogin();
  if (credential !== false) {
    emit('onSuccess', credential);
  }
}
</script>

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
      Markdown Editor
    </a>
    <div
      class="tw-w-full tw-bg-white tw-rounded-lg tw-shadow dark:tw-border md:tw-mt-0
      sm:tw-max-w-md xl:tw-p-0 dark:tw-border-gray-500"
    >
      <div class="tw-p-6 tw-space-y-4 md:tw-space-y-6 sm:tw-p-8 dark:tw-bg-stone-800 tw-rounded-lg">
        <h5
          class="tw-text-xl tw-font-bold tw-leading-tight tw-tracking-tight tw-text-gray-900
          md:tw-text-2xl dark:tw-text-stone-300"
        >
          {{ $t('actions.login') }}
        </h5>
        <q-form class="tw-space-y-4 md:tw-space-y-6">
          <q-input
            ref="inputRef"
            filled
            dense
            v-model="username"
            type="email"
            :label="$t('email')"
            label-color="tw-text-gray-900 dark:tw-text-stone-300"
            input-class="tw-text-gray-900 dark:tw-text-stone-300"
            class="dark:tw-bg-stone-700 tw-rounded-md"
          >
            <template v-if="username" v-slot:append>
              <q-icon
                name="cancel"
                class="tw-cursor-pointer tw-bg-white dark:tw-bg-stone-700 dark:tw-text-stone-300"
                @click.stop.prevent="username = ''"
              />
            </template>
          </q-input>
          <q-input
            filled
            dense
            v-model="password"
            type="password"
            v-on:keyup.enter="onSubmit"
            :label="$t('password')"
            label-color="tw-text-gray-900 dark:tw-text-stone-300"
            input-class="tw-text-gray-900 dark:tw-text-stone-300"
            class="dark:tw-bg-stone-700 tw-rounded-md"
          >
            <template v-if="password" v-slot:append>
              <q-icon
                name="cancel"
                class="tw-cursor-pointer tw-bg-white dark:tw-bg-stone-700 dark:tw-text-stone-300"
                @click.stop.prevent="password = ''"
              />
            </template>
          </q-input>
          <q-btn
            push
            dense
            size="lg"
            class="tw-text-white tw-bg-primary-600 tw-w-full"
            :label="$t('actions.login')"
            @click="onSubmit"
          />
          <div class="tw-inline-flex tw-items-center tw-justify-center tw-w-full">
            <hr class="tw-w-64 tw-h-px tw-bg-gray-200 tw-border-0 dark:tw-bg-gray-700">
            <span
              class="tw-absolute tw-px-3 tw-font-medium tw-text-gray-900 -tw-translate-x-1/2
              tw-bg-white tw-left-1/2 dark:tw-text-white dark:tw-bg-stone-800">
              {{ $t('loginPage.alternative') }}
            </span>
          </div>
        </q-form>

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
        <div class="tw-inline-flex tw-items-center tw-justify-center tw-w-full">
          <hr class="tw-w-64 tw-h-px tw-bg-gray-200 tw-border-0 dark:tw-bg-gray-700">
          <span
            class="tw-absolute tw-px-3 tw-font-medium tw-text-gray-900 -tw-translate-x-1/2
            tw-bg-white tw-left-1/2 dark:tw-text-white dark:tw-bg-stone-800">
            {{ $t('loginPage.alternative') }}
          </span>
        </div>
        <q-btn
          push
          dense
          size="lg"
          class="tw-text-white tw-bg-primary-600 tw-w-full"
          :label="$t('loginPage.useEditorOnly')"
          to="/editor"
        />
        <p class="tw-text-sm tw-font-light tw-text-gray-500 dark:tw-text-gray-400">
          {{ $t('loginPage.registerHint') }}
          <router-link to="/register"
            class="tw-font-medium tw-text-primary-600 hover:tw-underline
            dark:tw-text-primary-500"
          >
            {{ $t('loginPage.createAccount') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { auth, firebaseApp } from 'src/boot/firebase';
import { useAuthStore } from 'src/modules/firebase/stores/authStore';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import { OAuthCredential } from 'firebase/auth';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { App } from '@capacitor/app';

const $q = useQuasar();

const i18n = useI18n();

const router = useRouter();

const authStore = useAuthStore();

const username = ref('');

const password = ref('');

async function onSubmit() {
  const success = await authStore.login(username.value, password.value);
  if (success) {
    router.replace('/');
  }
}

async function loginWithCredential(credentialJson: string) {
  if (authStore.user) {
    return;
  }
  const credential = OAuthCredential.fromJSON(credentialJson);
  if (!credential) {
    $q.notify({
      type: 'error',
      message: i18n.t('auth.unknownError'),
    });
    return;
  }
  await authStore.credentialLogin(credential);
}

async function googleLogin() {
  if (process.env.MODE === 'spa') {
    await authStore.googleLogin();
  }
  if (process.env.MODE === 'electron' || process.env.MODE === 'capacitor') {
    const domain = firebaseApp.options.authDomain;
    const callbackId = uuidv4();
    const aRef = document.createElement('a');
    aRef.href = `https://${domain}/auth/google?callbackId=${callbackId}`;
    aRef.target = '_blank';
    aRef.click();
    if (process.env.MODE === 'electron') {
      window.windowApi.handleOauth(async (event, credentialJson) => {
        await loginWithCredential(credentialJson);
      });
    }
    if (process.env.MODE === 'capacitor') {
      App.addListener('appUrlOpen', async (evt) => {
        const url = new URL(evt.url);
        if (url.pathname !== '//verifyAuth') {
          $q.notify({
            type: 'error',
            message: `Wrong hostname: ${url.pathname}`,
          });
          return;
        }
        const credentialJson = url.searchParams.get('credential');
        if (!credentialJson) {
          $q.notify({
            type: 'error',
            message: 'No credential',
          });
          return;
        }
        await loginWithCredential(credentialJson);
      });
    }
  }
}

auth.onAuthStateChanged((user) => {
  if (user) {
    if (!user.emailVerified) {
      router.replace('/verifying');
    } else {
      router.replace('/');
    }
  }
});
</script>

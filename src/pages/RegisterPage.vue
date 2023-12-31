<template>
  <div class="tw-flex tw-flex-col tw-items-center tw-justify-center
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
      sm:tw-max-w-md xl:tw-p-0 dark:tw-bg-stone-800 dark:tw-border-gray-500"
    >
      <div class="tw-p-6 tw-space-y-4 md:tw-space-y-6 sm:tw-p-8 dark:tw-bg-stone-800 tw-rounded-lg">
        <h5
          class="tw-text-xl tw-font-bold tw-leading-tight tw-tracking-tight tw-text-gray-900
          md:tw-text-2xl dark:tw-text-stone-300"
        >
          {{ $t('actions.register') }}
        </h5>
        <q-form class="tw-space-y-4 md:tw-space-y-6">
          <q-input
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
          <q-input
            filled
            dense
            v-model="displayName"
            type="text"
            :label="$t('displayName')"
            label-color="tw-text-gray-900 dark:tw-text-stone-300"
            input-class="tw-text-gray-900 dark:tw-text-stone-300"
            class="dark:tw-bg-stone-700 tw-rounded-md"
          >
            <template v-if="displayName" v-slot:append>
              <q-icon
                name="cancel"
                class="tw-cursor-pointer tw-bg-white dark:tw-bg-stone-700 dark:tw-text-stone-300"
                @click.stop.prevent="displayName = ''"
              />
            </template>
          </q-input>
          <q-btn
            push
            dense
            size="lg"
            class="tw-text-white tw-bg-primary-600 tw-w-full"
            :label="$t('actions.register')"
            @click="onSubmit"
          />
          <p class="tw-text-sm tw-font-light tw-text-gray-500 dark:tw-text-gray-400">
            {{ $t('registerPage.loginHint') }}
            <router-link to="/login"
              class="tw-font-medium tw-text-primary-600 hover:tw-underline
              dark:tw-text-primary-500"
            >
              {{ $t('registerPage.login') }}
            </router-link>
          </p>
        </q-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { auth } from 'src/boot/firebase';
import { useAuthStore } from 'src/modules/firebase/stores/authStore';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const authStore = useAuthStore();

const username = ref('');

const password = ref('');

const displayName = ref('');

async function onSubmit() {
  await authStore.register(username.value, password.value, displayName.value);
}

auth.onAuthStateChanged((user) => {
  if (user && user.emailVerified) {
    router.replace('/');
  } else if (user && !user.emailVerified) {
    router.replace('/verifying');
  }
});
</script>

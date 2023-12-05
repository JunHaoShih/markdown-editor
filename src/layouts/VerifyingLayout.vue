<template>
  <q-layout view="lHh lpr lFf">
    <q-header elevated>
      <TitleBar
        title="Markdown Editor"
      >
        <template v-slot:end>
          <q-btn round>
            <template v-slot:default>
              <q-avatar icon="account_circle" class="q-electron-drag--exception">
                <q-menu :dark="darkStore.isDark">
                  <q-list
                    class="tw-bg-white tw-text-gray-900 dark:tw-bg-stone-800 dark:tw-text-stone-300"
                  >
                    <q-item clickable v-close-popup>
                      <q-item-section avatar>
                        <q-icon name="account_circle" />
                      </q-item-section>
                      <q-item-section>{{ authStore.user?.displayName }}</q-item-section>
                    </q-item>
                    <q-separator class="dark:tw-bg-stone-200" />
                    <!-- language -->
                    <q-item clickable v-close-popup>
                      <q-item-section
                        @click="setLanguage('zh-TW')">{{ $t('lang.zhTW') }}</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup>
                      <q-item-section
                        @click="setLanguage('en-US')">{{ $t('lang.enUS') }}</q-item-section>
                    </q-item>
                    <q-separator class="dark:tw-bg-stone-200" />
                    <!-- logout -->
                    <q-item clickable v-close-popup>
                      <q-item-section
                        @click="onLogoutClicked">{{ $t('actions.logout') }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-avatar>
            </template>
          </q-btn>
        </template>
      </TitleBar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { auth } from 'src/boot/firebase';
import TitleBar from 'src/components/TitleBar.vue';
import { useAuthStore } from 'src/modules/firebase/stores/authStore';
import { useDarkStore } from 'src/stores/darkModeStore';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const i18n = useI18n();

const router = useRouter();

const authStore = useAuthStore();

const darkStore = useDarkStore();

function setLanguage(lang: string): void {
  i18n.locale.value = lang;
}

async function onLogoutClicked(): Promise<void> {
  await authStore.logout();
}

auth.onAuthStateChanged((user) => {
  if (user) {
    authStore.user = user;
    if (!user.emailVerified) {
      return;
    }
    router.replace('/');
  } else {
    router.replace('login');
  }
});
</script>

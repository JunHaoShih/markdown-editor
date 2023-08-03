<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-dark">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Markdown Editor
        </q-toolbar-title>

        <q-avatar size="48px" icon="account_circle">
          <q-menu>
            <q-item clickable v-close-popup>
              <q-item-section avatar>
                <q-avatar icon="account_circle">
                </q-avatar>
              </q-item-section>
              <q-item-section>{{ authStore.user?.displayName }}</q-item-section>
            </q-item>
            <q-separator />
            <!-- language -->
            <q-item clickable v-close-popup>
              <q-item-section @click="setLanguage('zh-TW')">{{ $t('lang.zhTW') }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section @click="setLanguage('en-US')">{{ $t('lang.enUS') }}</q-item-section>
            </q-item>
            <q-separator />
            <!-- logout -->
            <q-item clickable v-close-popup>
              <q-item-section @click="onLogoutClicked">{{ $t('actions.logout') }}</q-item-section>
            </q-item>
          </q-menu>
        </q-avatar>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      :width="drawerWidth"
      show-if-above
      bordered
    >
      <q-list>
        <FolderTree
          class="q-px-sm tree-height"
        ></FolderTree>
      </q-list>
      <!-- drawer resizer -->
      <!-- https://github.com/quasarframework/quasar/issues/7099 -->
      <div
        v-touch-pan.preserveCursor.prevent.mouse.horizontal="resizeDrawer as TouchPanValue"
        class="q-drawer__resizer"
      ></div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FolderTree from 'src/modules/folderViews/components/FolderTree.vue';
import { onAuthStateChanged } from '@firebase/auth';
import { auth } from 'src/boot/firebase';
import { useAuthStore } from 'src/modules/firebase/stores/authStore';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { TouchPanValue } from 'quasar';

const i18n = useI18n();

const router = useRouter();

const authStore = useAuthStore();

let initialDrawerWidth = 0;

const drawerMaxWidth = 600;

const drawerWidth = ref(300);

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function setLanguage(lang: string): void {
  i18n.locale.value = lang;
}

async function onLogoutClicked(): Promise<void> {
  await authStore.logout();
}

function resizeDrawer(details: {
  isFirst: boolean,
  offset: {
    x: number,
    y: number,
  },
}) {
  if (details.isFirst) {
    initialDrawerWidth = drawerWidth.value;
  }
  drawerWidth.value = Math.min(initialDrawerWidth + details.offset.x, drawerMaxWidth);
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    authStore.user = user;
  } else {
    router.push('/login');
  }
});
</script>

<style lang="sass" scoped>
.q-drawer__resizer
  position: absolute
  top: 0
  bottom: 0
  right: -2px
  width: 1px
  background-color: $grey-5
  cursor: ew-resize

  &:after
    content: ''
    position: absolute
    top: 50%
    height: 30px
    left: -2px
    right: -2px
    transform: translateY(-50%)
    background-color: $accent
    border-radius: 4px

.tree-height
  height: 100vh
</style>

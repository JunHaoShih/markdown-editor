<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <TitleBar
        title="Markdown Editor"
      >
        <template v-slot:front>
          <q-btn
            flat
            dense
            round
            icon="menu"
            aria-label="Menu"
            @click="toggleLeftDrawer"
          />
        </template>
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

    <q-drawer
      v-model="leftDrawerOpen"
      :width="drawerWidth"
      show-if-above
      mini-to-overlay
      bordered
      :mini="true"
      class="tw-bg-white dark:tw-bg-stone-800"
    >
      <q-scroll-area style="width: inherit; height: calc(100vh - 55px);">
        <q-list
          class="tw-text-black dark:tw-text-stone-200"
        >
          <q-item-label
            header
          >
            {{ $t('menu') }}
          </q-item-label>
          <NavItem
            v-for="link in essentialLinks"
            :key="link.title"
            :navNode="link"
            :is-dark="darkStore.isDark"
          />
        </q-list>
      </q-scroll-area>
      <!-- drawer resizer -->
      <!-- https://github.com/quasarframework/quasar/issues/7099 -->
      <div
        v-touch-pan.preserveCursor.prevent.mouse.horizontal="resizeDrawer"
        class="q-drawer__resizer"
      ></div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onAuthStateChanged } from '@firebase/auth';
import { auth } from 'src/boot/firebase';
import { useAuthStore } from 'src/modules/firebase/stores/authStore';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import TitleBar from 'src/components/TitleBar.vue';
import NavItem, { NavNode } from 'src/components/NavItem.vue';
import { useDarkStore } from 'src/stores/darkModeStore';

const i18n = useI18n();

const router = useRouter();

const authStore = useAuthStore();

const darkStore = useDarkStore();

let initialDrawerWidth = 0;

const drawerMaxWidth = 600;

const drawerWidth = ref(300);

const leftDrawerOpen = ref(false);

const essentialLinks = computed(
  (): NavNode[] => [
    {
      title: i18n.t('workspacePage.workspace'),
      caption: i18n.t('workspacePage.caption'),
      icon: 'workspaces',
      to: '/workspace',
    },
    {
      title: i18n.t('trashBinPage.trashBin'),
      caption: i18n.t('trashBinPage.caption'),
      icon: 'delete',
      to: '/trashBin',
    },
    {
      title: i18n.t('diagramPage.diagram'),
      caption: i18n.t('diagramPage.caption'),
      icon: 'insert_chart',
      to: '/diagram',
    },
  ],
);

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
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  if (details.isFirst) {
    initialDrawerWidth = drawerWidth.value;
  }
  if (details.offset?.x) {
    drawerWidth.value = Math.min(initialDrawerWidth + details.offset.x, drawerMaxWidth);
  }
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
  height: calc( 100vh - 50px )
</style>

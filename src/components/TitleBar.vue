<template>
  <div>
    <q-toolbar class="tw-bg-black q-electron-drag">
      <slot name="front"></slot>
      <q-icon name="face" size="sm" class="tw-text-primary-600 tw-pl-1"/>
      <q-toolbar-title class="tw-hidden sm:tw-block">
        {{ title }}
      </q-toolbar-title>

      <q-space />

      <!-- Dark mode button -->
      <q-btn round>
        <template v-slot:default>
          <q-avatar
            size="30px"
            :icon="darkStore.isDark ? 'dark_mode' : 'light_mode'"
            :class="darkStore.isDark ? 'tw-text-primary-600' : 'tw-text-amber-600'"
          >
            <q-menu :dark="darkStore.isDark">
              <q-list
                class="tw-bg-white tw-text-gray-900 dark:tw-bg-stone-800 dark:tw-text-stone-300"
              >
                <q-item
                  v-for="theme in themes"
                  v-bind:key="theme.mode"
                  clickable v-close-popup
                  @click="theme.onClick"
                >
                <q-item-section avatar>
                  <q-icon :class="theme.icon.class" :name="theme.icon.name" />
                </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ $t(theme.name) }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon
                      v-if="theme.mode === darkStore.colorScheme"
                      name="check" color="green"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-avatar>
        </template>
      </q-btn>

      <slot name="end"></slot>

      <!-- Electron only panel -->
      <div class="electron-only">
        <q-btn dense flat icon="minimize" @click="minimize" />
        <q-btn dense flat :icon="maximizeState" @click="toggleMaximize" />
        <q-btn dense flat icon="close" @click="close" />
      </div>
    </q-toolbar>
  </div>
</template>

<script setup lang="ts">
import { ThemeMode, useDarkStore } from 'src/stores/darkModeStore';
import { onBeforeMount, ref } from 'vue';

type MaximizeState = 'crop_square' | 'filter_none';

const maximizeState = ref<MaximizeState>('crop_square');

const darkStore = useDarkStore();

interface ThemeAction {
  mode: ThemeMode,
  icon: {
    class: string,
    name: string,
  },
  name: string,
  onClick:() => void,
}

const themes: ThemeAction[] = [
  {
    mode: 'light',
    icon: {
      name: 'light_mode',
      class: 'tw-text-amber-600',
    },
    name: 'themes.light',
    onClick: () => {
      darkStore.colorScheme = 'light';
    },
  },
  {
    mode: 'dark',
    icon: {
      name: 'dark_mode',
      class: 'tw-text-primary-600',
    },
    name: 'themes.dark',
    onClick: () => {
      darkStore.colorScheme = 'dark';
    },
  },
  {
    mode: 'system',
    icon: {
      name: 'sync',
      class: 'tw-text-green-600',
    },
    name: 'themes.system',
    onClick: () => {
      darkStore.colorScheme = 'system';
    },
  },
];

defineProps<{
  title: string,
}>();

function minimize() {
  if (process.env.MODE === 'electron') {
    window.windowApi.minimize();
  }
}

function toggleMaximize() {
  if (process.env.MODE === 'electron') {
    window.windowApi.toggleMaximize();
  }
}

function close() {
  if (process.env.MODE === 'electron') {
    window.windowApi.close();
  }
}

onBeforeMount(() => {
  if (process.env.MODE === 'electron') {
    window.windowApi.handleIsMaximized((_event, isMaximized) => {
      maximizeState.value = isMaximized
        ? 'filter_none'
        : 'crop_square';
    });
  }
});
</script>

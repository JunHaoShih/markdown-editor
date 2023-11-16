<template>
  <div>
    <q-toolbar class="tw-bg-black q-electron-drag">
      <slot name="front"></slot>
      <q-icon name="face" size="sm" class="tw-text-primary-600 tw-pl-1"/>
      <q-toolbar-title>
        {{ title }}
      </q-toolbar-title>

      <q-space />

      <q-btn
        v-if="darkStore.isDark"
        dense
        flat
        icon="dark_mode"
        class="tw-text-primary-600"
        @click="darkStore.colorScheme = 'light'"
      />

      <q-btn
        v-if="!darkStore.isDark"
        dense
        flat
        icon="light_mode"
        class="tw-text-amber-600"
        @click="darkStore.colorScheme = 'dark'"
      />

      <slot name="end"></slot>

      <div class="electron-only">
        <q-btn dense flat icon="minimize" @click="minimize" />
        <q-btn dense flat :icon="maximizeState" @click="toggleMaximize" />
        <q-btn dense flat icon="close" @click="close" />
      </div>
    </q-toolbar>
  </div>
</template>

<script setup lang="ts">
import { useDarkStore } from 'src/stores/darkModeStore';
import { onBeforeMount, ref } from 'vue';

type MaximizeState = 'crop_square' | 'filter_none';

const maximizeState = ref<MaximizeState>('crop_square');

const darkStore = useDarkStore();

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

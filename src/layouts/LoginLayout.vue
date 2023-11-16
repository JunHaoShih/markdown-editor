<template>
  <q-layout
    view="lHh lpr lFf"
    :class="darkStore.isDark ? 'tw-dark tw-bg-darkBg' : 'tw-bg-gray-50'">>
    <q-header elevated>
      <title-bar title="Markdown Editor">
      </title-bar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import TitleBar from 'src/components/TitleBar.vue';
import { useDarkStore } from 'src/stores/darkModeStore';

const darkStore = useDarkStore();
</script>

<template>
  <q-layout view="lHh lpr lFf">
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
</script>

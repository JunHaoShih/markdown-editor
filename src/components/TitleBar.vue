<template>
  <div>
    <q-toolbar class="bg-dark q-electron-drag">
      <slot name="front"></slot>
      <q-toolbar-title>
        {{ title }}
      </q-toolbar-title>

      <q-space />

      <slot name="end"></slot>

      <div class="electron-only">
        <q-btn dense flat icon="minimize" @click="minimize" />
        <q-btn dense flat icon="crop_square" @click="toggleMaximize" />
        <q-btn dense flat icon="close" @click="close" />
      </div>
    </q-toolbar>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string,
}>();

function minimize() {
  window.windowApi.minimize();
}

function toggleMaximize() {
  window.windowApi.toggleMaximize();
}

function close() {
  window.windowApi.close();
}
</script>

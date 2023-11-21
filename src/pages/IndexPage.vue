<template>
  <div class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-px-6
    tw-mx-auto tw-h-screen xl:tw-px-0 dark:tw-bg-stone-800"
  >
    <div class="tw-text-center xl:tw-max-w-4xl">
      <h1 class="tw-mb-3 tw-text-2xl tw-font-bold tw-leading-tight tw-text-gray-900
        sm:tw-text-4xl lg:tw-text-5xl dark:tw-text-white"
      >
        MarkdownEditor
      </h1>
      <p class="tw-text-sm tw-font-light tw-text-gray-500 dark:tw-text-gray-400">
        <router-link to="/workspace"
          class="tw-font-medium tw-text-primary-600 hover:tw-underline
          dark:tw-text-primary-500"
        >
          {{ $t('indexPage.toWorkspace') }}
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

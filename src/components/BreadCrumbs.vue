<template>
  <nav class="tw-flex tw-relative" aria-label="BreadCrumb">
    <ol
      class="tw-inline-flex tw-items-center tw-space-x-1 md:tw-space-x-2 rtl:tw-space-x-reverse
      tw-overflow-y-auto"
    >
      <li
        v-for="(breadcrumb, index) in breadcrumbs"
        :key="breadcrumb.to"
        class="tw-inline-flex tw-items-center tw-space-x-1"
      >
        <q-icon
          v-if="index > 0"
          name="navigate_next" size="1rem"
          class="tw-text-gray-900 dark:tw-text-stone-300"
        />
        <router-link :to="breadcrumb.to"
          :class="
          (breadcrumb.to === route.path
          ? 'tw-text-primary-600 '
          : 'tw-text-gray-900 dark:tw-text-stone-300 ') +
          `tw-inline-flex tw-items-center tw-text-sm tw-font-medium`"
        >
          <q-icon :name="breadcrumb.icon" size="18px" class="tw-me-2" />
          <span class="tw-whitespace-nowrap hover:tw-underline">
            {{ breadcrumb.label }}
          </span>
        </router-link>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

export interface BreadCrumbInfo {
  icon?: string,
  label?: string,
  to: string,
}

const route = useRoute();

defineProps<{
  breadcrumbs: BreadCrumbInfo[],
}>();
</script>

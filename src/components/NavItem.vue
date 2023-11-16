<template>
  <q-item
    v-if="!navNode.children"
    clickable
    tag="a"
    :to="navNode.to"
    :active-class="isDark ? 'tw-text-primary-400' : 'tw-text-primary-600'"
  >
    <q-item-section v-if="navNode.icon" avatar>
      <q-icon :name="navNode.icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>
        {{ navNode.title }}
      </q-item-label>
      <q-item-label
        v-if="navNode.caption"
        class="tw-text-xs"
      >
        {{ navNode.caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
  <q-expansion-item
    v-else
    expand-separator
    v-model="expanded"
    :icon="navNode.icon"
    :label="navNode.title"
    :caption="navNode.caption"
    :content-inset-level="navNode.contentInsetLevel ? navNode.contentInsetLevel : 0"
    @click="onExpansionClicked"
  >
    <NavItem
      v-for="child in navNode.children"
      :key="child.title"
      :navNode="child"
      :is-dark="isDark"
    />
  </q-expansion-item>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export interface NavNode{
  title: string,
  caption?: string,
  icon?: string,
  to?: string,
  children?: NavNode[],
  contentInsetLevel?: number,
}

const props = defineProps<{
  navNode: NavNode,
  isDark: boolean,
}>();

const router = useRouter();

const expanded = ref(false);

function onExpansionClicked() {
  if (props.navNode.to && expanded.value) {
    router.push(props.navNode.to);
  }
}

</script>

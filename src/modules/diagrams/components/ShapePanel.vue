<template>
  <div class="flex-container">
    <div
      v-for="icon in icons"
      v-bind:key="icon.type"
      draggable="true"
      @dragstart="onDragStart($event, icon)"
      class="icon-btn"
    >
      <svg
        :viewBox="icon.viewBox"
        width="70"
        height="40"
      >
        <path
          :d="icon.path"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IconInfo } from '../models/iconInfo';
import { dbTableIcon } from '../services/dbTableService';

function onDragStart(ev: DragEvent, icon: IconInfo) {
  ev.dataTransfer?.setData('text', icon.type);
  // Namespace of svg, do not change it
  const svgNS = 'http://www.w3.org/2000/svg';
  // Create an SVG element
  const svg = document.createElementNS(svgNS, 'svg');

  // Create a rectangle element within the SVG
  const shape = document.createElementNS(svgNS, icon.svgType);
  icon.attributes.forEach((attr) => {
    shape.setAttribute(attr.key, attr.value);
  });
  svg.appendChild(shape);
  const svgImage = new Image();
  const svgData = new XMLSerializer().serializeToString(svg);
  svgImage.src = `data:image/svg+xml,${encodeURIComponent(svgData)}`;
  ev.dataTransfer?.setDragImage(svgImage, 0, 0);
}

const icons = computed(
  () => [
    dbTableIcon,
  ],
);
</script>

<style lang="scss" scoped>
.flex-container {
  display: flex;
}

.icon-btn {
  border-style: solid;
  border-width: 2px;
  border-radius: 5px;
  border-color: red;
}

.icon-btn:hover {
  background-color: lightgray;
}
</style>

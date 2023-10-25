<template>
  <div class="tw-flex tw-flex-row tw-flex-wrap">
    <div
      v-for="icon in icons"
      v-bind:key="icon.type"
      draggable="true"
      @dragstart="onDragStart($event, icon)"
      class="tw-border-solid tw-border-2 tw-rounded-md tw-border-black hover:tw-bg-gray-200"
    >
      <svg
        :viewBox="icon.viewBox"
        width="60"
        height="40"
      >
        <path
          :d="icon.path"
        />
      </svg>
      <q-tooltip>{{ $t(`${icon.name}`) }}</q-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from 'vue';
import { IconInfo } from '../models/iconInfo';
import { dbTableIcon } from '../services/dbTableService';
import { circleIcon, ellipseIcon, ractangleIcon } from '../services/basicShapeService';
import { ShapeType } from '../models/shape';

interface ImageInfo {
  type: ShapeType,
  svgImage: HTMLImageElement,
}

const svgImages: ImageInfo[] = [];

function onDragStart(ev: DragEvent, icon: IconInfo) {
  ev.dataTransfer?.setData('text', icon.type);
  const svgImage = svgImages.find((svg) => svg.type === icon.type);
  if (!svgImage) {
    return;
  }
  ev.dataTransfer?.setDragImage(svgImage.svgImage, 0, 0);
}

const icons = computed(
  () => [
    dbTableIcon,
    ractangleIcon,
    ellipseIcon,
    circleIcon,
  ],
);

onBeforeMount(() => {
  icons.value.forEach((icon) => {
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
    svgImages.push({
      type: icon.type,
      svgImage,
    });
  });
});
</script>

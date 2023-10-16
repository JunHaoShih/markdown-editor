<template>
  <g @mouseup.stop="">
    <path
      :d="selectedPath"
      :stroke="stroke"
      :stroke-width="strokeWidth"
      fill="transparent"
      stroke-linecap="round"
      stroke-dasharray="5,5"
    />
    <g
      v-if="leftResizable"
      style="cursor: col-resize;"
      v-touch-pan.mouse="resizeLeft"
    >
      <circle
        :cx="x - (margin * 4)"
        :cy="(topLeft.y + bottomLeft.y) / 2"
        r="5"
        fill="#29b6f2"
      />
      <line
        :x1="topLeft.x" :y1="topLeft.y"
        :x2="bottomLeft.x" :y2="bottomLeft.y"
        stroke="transparent"
        stroke-width="5"
      />
    </g>
    <g
      v-if="rightResizable"
      v-touch-pan.mouse.horizontal="resizeRight"
      style="cursor: col-resize;"
    >
      <circle
        :cx="x + width + (margin * 4)"
        :cy="(topRight.y + bottomRight.y) / 2"
        r="5"
        fill="#29b6f2"
      />
      <line
        :x1="topRight.x" :y1="topRight.y"
        :x2="bottomRight.x" :y2="bottomRight.y"
        stroke="transparent"
        stroke-width="5"
      />
    </g>
    <g
      v-if="bottomResizable"
      v-touch-pan.mouse="resizeBottom"
      style="cursor: row-resize;"
    >
      <circle
        :cx="(bottomLeft.x + bottomRight.x) / 2"
        :cy="y + height + (margin * 4)"
        r="5"
        fill="#29b6f2"
      />
      <line
        :x1="bottomLeft.x" :y1="bottomLeft.y"
        :x2="bottomRight.x" :y2="bottomRight.y"
        stroke="transparent"
        stroke-width="5"
      />
    </g>
    <g
      v-if="topResizable"
      v-touch-pan.mouse="resizeTop"
      style="cursor: row-resize;"
    >
      <circle
        :cx="(x + topRight.x) / 2"
        :cy="y - (margin * 4)"
        r="5"
        fill="#29b6f2"
      />
      <line
        :x1="topLeft.x" :y1="topLeft.y"
        :x2="topRight.x" :y2="topRight.y"
        stroke="transparent"
        stroke-width="5"
        fill="red"
      />
    </g>
    <g
      v-if="topResizable && leftResizable"
      class="tw-cursor-nw-resize"
      v-touch-pan.mouse="resizeTopLeft"
    >
      <circle
        :cx="x - (margin * 4)"
        :cy="y - (margin * 4)"
        r="5"
        fill="#29b6f2"
      />
    </g>
    <g
      v-if="topResizable && rightResizable"
      class="tw-cursor-ne-resize"
      v-touch-pan.mouse="resizeTopRight"
    >
      <circle
        :cx="x + width + (margin * 4)"
        :cy="y - (margin * 4)"
        r="5"
        fill="#29b6f2"
      />
    </g>
    <g
      v-if="bottomResizable && leftResizable"
      class="tw-cursor-ne-resize"
      v-touch-pan.mouse="resizeBottomLeft"
    >
      <circle
        :cx="x - (margin * 4)"
        :cy="y + height + (margin * 4)"
        r="5"
        fill="#29b6f2"
      />
    </g>
    <g
      v-if="bottomResizable && rightResizable"
      class="tw-cursor-nw-resize"
      v-touch-pan.mouse="resizeBottomRight"
    >
      <circle
        :cx="x + width + (margin * 4)"
        :cy="y + height + (margin * 4)"
        r="5"
        fill="#29b6f2"
      />
    </g>
  </g>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { Point } from '../models/shape';

const props = withDefaults(defineProps<{
  margin: number,
  x: number,
  y: number,
  height: number,
  width: number,
  stroke: string,
  strokeWidth: string,
  leftResizable?: boolean,
  rightResizable?: boolean,
  bottomResizable?: boolean,
  topResizable?: boolean,
}>(), {
  margin: 0,
  stroke: 'black',
  strokeWidth: '2',
  leftResizable: false,
  rightResizable: false,
  bottomResizable: false,
  topResizable: false,
});

type Emit = {
  (e: 'onResize', isFirst?: boolean, newPosition?: Point, newWidth?: number, newHeight?: number): void
}
const emit = defineEmits<Emit>();

const topLeft = computed(
  (): Point => ({
    x: props.x - props.margin,
    y: props.y - props.margin,
  }),
);

const bottomLeft = computed(
  (): Point => ({
    x: props.x - props.margin,
    y: props.y + props.height + props.margin,
  }),
);

const topRight = computed(
  (): Point => ({
    x: props.x + props.width + props.margin,
    y: props.y - props.margin,
  }),
);

const bottomRight = computed(
  (): Point => ({
    x: props.x + props.width + props.margin,
    y: props.y + props.height + props.margin,
  }),
);

const selectedPath = computed(
  () => `M ${props.x - props.margin} ${props.y - props.margin} \
  H ${props.x + props.width + props.margin} \
  V ${props.y + props.height + props.margin} \
  H ${props.x - props.margin} V ${props.y - props.margin}`,
);

const initialPosition: Point = {
  x: 0,
  y: 0,
};

let initialWidth = 0;

let initialHeight = 0;

interface ResizeInfo {
  topResizable?: boolean,
  bottomResizable?: boolean,
  leftResizable?: boolean,
  rightResizable?: boolean,
}

function getNewWidth(resizeInfo: ResizeInfo, offsetX: number, defaultWidth: number) {
  if (resizeInfo.leftResizable) {
    return defaultWidth - offsetX;
  }
  if (resizeInfo.rightResizable) {
    return defaultWidth + offsetX;
  }
  return defaultWidth;
}

function getNewHeight(resizeInfo: ResizeInfo, offsetY: number, defaultHeight: number) {
  if (resizeInfo.topResizable) {
    return defaultHeight - offsetY;
  }
  if (resizeInfo.bottomResizable) {
    return defaultHeight + offsetY;
  }
  return defaultHeight;
}

function resize(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}, info: ResizeInfo) {
  if (details.isFirst) {
    initialPosition.x = props.x;
    initialPosition.y = props.y;
    initialHeight = props.height;
    initialWidth = props.width;
    emit('onResize', true);
  }
  if (details.offset && details.offset.y && details.offset.x) {
    const newX = info.leftResizable
      ? initialPosition.x + details.offset.x
      : initialPosition.x;
    const newWidth = getNewWidth(info, details.offset.x, initialWidth);

    const newY = info.topResizable
      ? initialPosition.y + details.offset.y
      : initialPosition.y;
    const newHeight = getNewHeight(info, details.offset.y, initialHeight);
    emit('onResize', false, {
      x: newX,
      y: newY,
    }, newWidth, newHeight);
  }
}

function resizeLeft(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  resize(details, {
    leftResizable: true,
  });
}

function resizeRight(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  resize(details, {
    rightResizable: true,
  });
}

function resizeTop(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  resize(details, {
    topResizable: true,
  });
}

function resizeBottom(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  resize(details, {
    bottomResizable: true,
  });
}

function resizeTopLeft(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  resize(details, {
    topResizable: true,
    leftResizable: true,
  });
}

function resizeTopRight(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  resize(details, {
    topResizable: true,
    rightResizable: true,
  });
}

function resizeBottomLeft(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  resize(details, {
    bottomResizable: true,
    leftResizable: true,
  });
}

function resizeBottomRight(details: {
  isFirst?: boolean,
  offset?: {
    x?: number,
    y?: number,
  },
}) {
  resize(details, {
    bottomResizable: true,
    rightResizable: true,
  });
}
</script>

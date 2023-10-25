import { computed } from 'vue';
import { Point, Shape } from '../../models/shape';

export const useBasicSvgCalculation = (
  propModelValue: () => Shape,
  width: () => number | undefined,
  height: () => number | undefined,
  defaultMinWidth: () => number,
  defaultMinHeight: () => number,
  emit: {
    (e: 'update:modelValue', value: Shape): void
  },
) => {
  let originalX = 0;

  let originalY = 0;

  let originalBottomY = 0;

  let originalRightX = 0;

  const shape = computed({
    get: () => propModelValue(),
    set: (value) => emit('update:modelValue', value),
  });

  const shapeWidth = computed(
    () => width() ?? 0,
  );

  const shapeHeight = computed(
    () => height() ?? 0,
  );

  const minWidth = computed({
    get: (): number => shape.value.minWidth ?? defaultMinWidth(),
    set: (value) => {
      shape.value.minWidth = value;
    },
  });

  const minHeight = computed({
    get: (): number => shape.value.minHeight ?? defaultMinHeight(),
    set: (value) => {
      shape.value.minHeight = value;
    },
  });

  function onResize(isFirst?: boolean, newPosition?: Point, newWidth?: number, newHeight?: number) {
    if (isFirst) {
      originalX = shape.value.position.x;
      originalY = shape.value.position.y;
      originalRightX = shape.value.position.x + shapeWidth.value;
      originalBottomY = shape.value.position.y + shapeHeight.value;
      return;
    }

    if (!newPosition) {
      return;
    }

    if (newWidth) {
      shape.value.width = Math.max(newWidth, minWidth.value);
      if (shapeWidth.value > minWidth.value) {
        shape.value.position.x = newPosition.x;
      } else if (originalX === newPosition.x) {
        shape.value.position.x = originalX;
      } else {
        shape.value.position.x = originalRightX - shapeWidth.value;
      }
    }

    if (newHeight) {
      shape.value.height = Math.max(newHeight, minHeight.value);
      if (shapeHeight.value > minHeight.value) {
        shape.value.position.y = newPosition.y;
      } else if (originalY === newPosition.y) {
        shape.value.position.y = originalY;
      } else {
        shape.value.position.y = originalBottomY - shapeHeight.value;
      }
    }
  }

  return {
    shape,
    shapeWidth,
    shapeHeight,
    onResize,
  };
};

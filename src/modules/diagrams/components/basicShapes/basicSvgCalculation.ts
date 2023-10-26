import { computed } from 'vue';
import { Point, Shape } from '../../models/shape';

export const useBasicSvgCalculation = (
  propModelValue: () => Shape,
  defaultMinWidth: () => number,
  defaultMinHeight: () => number,
  emit: {
    (e: 'update:modelValue', value: Shape): void
  },
  aspectRatio?: () => boolean,
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
    () => shape.value.width ?? 0,
  );

  const shapeHeight = computed(
    () => shape.value.height ?? 0,
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

  function getCoordinateOffset(info: {
    currentLength: number,
    minLength: number,
    oldStartPosition: number,
    newStartPosition: number,
    oldEndPosition: number,
  }): number {
    if (info.currentLength > info.minLength) {
      return info.oldStartPosition - info.newStartPosition;
    }
    if (info.oldStartPosition === info.newStartPosition) {
      return 0;
    }
    return info.oldStartPosition - info.oldEndPosition + info.currentLength;
  }

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

    let finalWidth = 0;
    let xOffset = 0;

    if (newWidth) {
      finalWidth = Math.max(newWidth, minWidth.value);
      xOffset = getCoordinateOffset({
        currentLength: finalWidth,
        minLength: minWidth.value,
        oldStartPosition: originalX,
        newStartPosition: newPosition.x,
        oldEndPosition: originalRightX,
      });
    }

    let finalHeight = 0;
    let yOffset = 0;

    if (newHeight) {
      finalHeight = Math.max(newHeight, minHeight.value);
      yOffset = getCoordinateOffset({
        currentLength: finalHeight,
        minLength: minHeight.value,
        oldStartPosition: originalY,
        newStartPosition: newPosition.y,
        oldEndPosition: originalBottomY,
      });
    }

    if (finalWidth) {
      shape.value.width = finalWidth;
      shape.value.position.x = originalX - xOffset;
    }

    if (aspectRatio && aspectRatio()) {
      if (finalWidth) {
        shape.value.height = finalWidth;
      }
      if (!yOffset) {
        return;
      }
      const newY = xOffset === 0
        ? originalBottomY - finalWidth
        : originalY - xOffset;
      shape.value.position.y = newY;
    } else if (finalHeight) {
      shape.value.height = finalHeight;
      shape.value.position.y = originalY - yOffset;
    }
  }

  return {
    shape,
    shapeWidth,
    shapeHeight,
    onResize,
  };
};

import { v4 as uuidv4 } from 'uuid';

export interface Point {
  x: number,
  y: number,
}

export type ShapeType = 'dbTable' | 'rect';

export interface Shape {
  id: string,
  type: ShapeType,
  position: Point,
}

/**
 * Create Shape
 * @param x Svg position x
 * @param y Svg position y
 * @returns Svg shape
 */
export function createShape(x: number, y: number): Shape {
  return {
    id: uuidv4(),
    type: 'dbTable',
    position: {
      x,
      y,
    },
  };
}

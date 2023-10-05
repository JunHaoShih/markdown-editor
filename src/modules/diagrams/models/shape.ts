import { DbTableColumn } from './dbTableColumn';

type ShapeType = 'dbTable' | 'rectangle';

export interface Point {
  x: number,
  y: number,
}

interface SizeInfo {
  width?: number,
  minWidth?: number,
  height?: number,
  minHeight?: number,
}

export interface Shape {
  id: string,
  type: ShapeType,
  x: number,
  y: number,
  /**
   * Shape title
   */
  title: string,
  /**
   * Shape width
   */
  width: number,
  /**
   * Shape height
   */
  height: number,
  /**
   * Extran infomation of shape, please store extra info in here if sizeInfo is not enough
   */
  extraSizeInfos: Record<string, SizeInfo>,
  /**
   * Db table columns. Used only if type is 'dbTable'
   */
  dbColumns?: DbTableColumn[],
}

interface Line {
  id: string,
  fromShapeId?: string | null,
  toShapeId?: string | null,
  fromNode?: string | null,
  toNode: string | null,
  fromAbsolute?: Point | null,
  toAbsolute?: Point | null,
}

export interface Diagram {
  shapes: Shape[],
  lines: Line[],
}

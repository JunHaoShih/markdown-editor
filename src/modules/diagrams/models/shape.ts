import { DbTableColumn } from './dbTableColumn';

export type ShapeType = 'dbTable' | 'line' | 'rectangle';

export interface Point {
  x: number,
  y: number,
}

export type Orient = 'left' | 'top' | 'bottom' | 'right';

export interface ConnectionNode {
  id: string,
  point: Point,
  orient: Orient,
}

interface SizeInfo {
  width?: number,
  minWidth?: number,
  height?: number,
  minHeight?: number,
}

export interface Shape {
  /**
   * Shape id
   */
  id: string,
  /**
   * Shape type
   */
  type: ShapeType,
  position: Point,
  /**
   * Shape title
   */
  title: string,
  /**
   * Shape width
   */
  width?: number,
  /**
   * Shape height
   */
  height?: number,
  /**
   * Minimum width of shape
   */
  minWidth?: number,
  /**
   * Minimum height of shape
   */
  minHeight?: number,
  /**
   * All connectable nodes of this shape(does not include any child)
   */
  connectionNodes: ConnectionNode[],
  /**
   * Extran infomation of shape, please store extra info in here if sizeInfo is not enough
   */
  extraSizeInfos: Record<string, SizeInfo>,
  /**
   * Db table columns. Used only if type is 'dbTable'
   */
  dbColumns?: DbTableColumn[],
}

export interface Line {
  id: string,
  fromShapeId?: string | null,
  toShapeId?: string | null,
  fromNode?: string | null,
  toNode?: string | null,
  fromAbsolute?: Point | null,
  toAbsolute?: Point | null,
}

export interface Diagram {
  shapes: Shape[],
  lines: Line[],
}

import { DbTableColumn } from './dbTableColumn';

export type ArrowType = 'none' |'arrow' | 'zero2Many' | 'zero2One' | 'one2Many' | 'exactOne';

export type ShapeType = 'dbTable' | 'line' | 'rectangle' | 'ellipse' | 'circle';

export type LineType = 'straight' | 'diagnal' | 'orthogonal';

export interface Point {
  x: number,
  y: number,
}

export interface ConnectionNode {
  id: string,
  point: Point,
  orient: number,
}

interface SizeInfo {
  width?: number,
  minWidth?: number,
  height?: number,
  minHeight?: number,
}

export interface LineInfo {
  type: LineType,
  startDistance: number,
  endDistance: number,
  paths: Point[],
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
  /**
   * Shape position
   */
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
  /**
   * Shape id this line connect from
   */
  fromShapeId?: string,
  /**
   * Node id of starting connection node if shape is a line
   */
  fromNode?: string | null,
  /**
   * Shape id this line connect to
   */
  toShapeId?: string,
  /**
   * Node id of ending connection node if shape is a line
   */
  toNode?: string | null,
  /**
   * Absolute position of ending connection node if shape is a line
   */
  toAbsolute?: Point | null,
  /**
   * Starting arrow type
   */
  arrowStart?: ArrowType,
  /**
   * Ending arrow type
   */
  arrowEnd?: ArrowType,
  /**
   * Line information
   */
  lineInfo?: LineInfo,
}

export interface Diagram {
  shapes: Shape[],
}

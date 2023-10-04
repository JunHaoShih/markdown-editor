import { v4 as uuidv4 } from 'uuid';

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

export interface DbTableColumn {
  /**
   * Guid of this data
   */
  id: string,
  /**
   * Table column name
   */
  name: string,
  /**
   * Is column primary key
   */
  isPrimary: boolean,
  /**
   * Column data type
   */
  type: string,
  /**
   * Unique constraints
   */
  uniqueKeys: string,
  /**
   * Row height(Because db column is displayed as row, so it's row height)
   */
  height: number,
  /**
   * Id of left connection node
   */
  leftPointId: string,
  /**
   * Id of right connection node
   */
  rightPointId: string,
}

interface Shape {
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
  extraSizeInfos?: Record<string, SizeInfo>,
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

interface Diagram {
  shapes: Shape[],
  lines: Line[],
}

interface ShapeController {
  setX: (x: number) => ShapeController,
  setY: (y: number) => ShapeController,
  setPosition: (x: number, y: number) => ShapeController,
  setTitle: (title: string) => ShapeController,
}

function shapeInit(shape: Shape): ShapeController {
  return {
    setX(x): ShapeController {
      shape.x = x;
      return this;
    },
    setY(y): ShapeController {
      shape.y = y;
      return this;
    },
    setPosition(x, y): ShapeController {
      shape.x = x;
      shape.y = y;
      return this;
    },
    setTitle(title): ShapeController {
      shape.title = title;
      return this;
    },
  };
}

export interface DbColumnController {
  setName: (name: string) => DbColumnController,
  getName: () => string,
  getHeight: () => number,
}

export interface DbTableController {
  setX: (x: number) => DbTableController,
  setY: (y: number) => DbTableController,
  setPosition: (x: number, y: number) => DbTableController,
  shiftX: (x: number) => DbTableController,
  shiftY: (y: number) => DbTableController,
  setTitle: (title: string) => DbTableController,
  setWidth: (width: number) => DbTableController,
  setHeight: (height: number) => DbTableController,
  setIconWidth: (width: number) => DbTableController,
  setNameWidth: (width: number) => DbTableController,
  getX: () => number,
  getY: () => number,
  getTitle: () => string,
  getWidth: () => number,
  getHeight: () => number,
  getTitleHeight: () => number,
  getIconWidth: () => number,
  getNameWidth: () => number,
  getMinNameWidth: () => number,
  getTypeWidth: () => number,
  getLabelWidth: () => number,
  getRowStartY: (index: number) => number,
  addColumn: () => DbColumnController,
  findColumn: (colId: string) => DbColumnController,
  getColumns: () => DbTableColumn[],
}

function dbColumnInit(col: DbTableColumn): DbColumnController {
  return {
    setName(name) {
      col.name = name;
      return this;
    },
    getName() {
      return col.name;
    },
    getHeight() {
      return col.height;
    },
  };
}

function dbTableInit(shape: Shape): DbTableController {
  const minIconWidth = 30;

  const minNameWidth = 90;

  const minTypeWidth = 50;

  const minLabelWidth = 30;

  const defaultTitleHeight = 30;

  const defaultRowHeight = 30;

  function extraSizeInfosInitIfUndefined() {
    if (!shape.extraSizeInfos) {
      shape.extraSizeInfos = {};
      shape.extraSizeInfos.icon = { width: minIconWidth, minWidth: minIconWidth };
      shape.extraSizeInfos.name = { width: minNameWidth, minWidth: minNameWidth };
      shape.extraSizeInfos.type = { width: minTypeWidth, minWidth: minTypeWidth };
      shape.extraSizeInfos.label = { width: minLabelWidth, minWidth: minLabelWidth };
      shape.extraSizeInfos.title = { height: defaultTitleHeight };
    }
  }
  extraSizeInfosInitIfUndefined();

  return {
    setX(x): DbTableController {
      shape.x = x;
      return this;
    },
    setY(y): DbTableController {
      shape.y = y;
      return this;
    },
    shiftX(x) {
      shape.x += x;
      return this;
    },
    shiftY(y) {
      shape.y += y;
      return this;
    },
    setPosition(x, y): DbTableController {
      shape.x = x;
      shape.y = y;
      return this;
    },
    setTitle(title): DbTableController {
      shape.title = title;
      return this;
    },
    setWidth(width) {
      shape.width = width;
      return this;
    },
    setHeight(height) {
      shape.height = height;
      return this;
    },
    setIconWidth(width): DbTableController {
      if (shape.extraSizeInfos) {
        shape.extraSizeInfos.icon.width = width;
      }
      return this;
    },
    setNameWidth(width): DbTableController {
      if (shape.extraSizeInfos) {
        shape.extraSizeInfos.name.width = width;
      }
      return this;
    },
    getX() {
      return shape.x;
    },
    getY() {
      return shape.y;
    },
    getTitle() {
      return shape.title;
    },
    getWidth() {
      return shape.width;
    },
    getHeight() {
      const currentTitleHeight = shape.extraSizeInfos?.title.height ?? defaultTitleHeight;
      const totalColHeight = shape.dbColumns
        ? shape.dbColumns
          .map((dbCol) => dbCol.height)
          .reduce((accumulator, current) => accumulator + current, 0)
        : 0;
      const totalHeight = currentTitleHeight + totalColHeight;
      return totalHeight;
    },
    getTitleHeight() {
      return shape.extraSizeInfos?.title.height ?? defaultTitleHeight;
    },
    getIconWidth() {
      extraSizeInfosInitIfUndefined();
      return shape.extraSizeInfos?.icon.width ?? minIconWidth;
    },
    getNameWidth() {
      extraSizeInfosInitIfUndefined();
      return shape.extraSizeInfos?.name.width ?? minNameWidth;
    },
    getMinNameWidth() {
      return minNameWidth;
    },
    getTypeWidth() {
      extraSizeInfosInitIfUndefined();
      return shape.extraSizeInfos?.type.width ?? minTypeWidth;
    },
    getLabelWidth() {
      extraSizeInfosInitIfUndefined();
      return shape.extraSizeInfos?.label.width ?? minLabelWidth;
    },
    getRowStartY(index) {
      const totalColHeight = shape.dbColumns
        ? shape.dbColumns
          .map((dbCol) => dbCol.height)
          .reduce((accumulator, current, currentIndex) => {
            if (currentIndex >= index) {
              return accumulator;
            }
            return accumulator + current;
          }, 0)
        : 0;
      return shape.y
        + this.getTitleHeight()
        + totalColHeight;
    },
    addColumn() {
      const col: DbTableColumn = {
        id: uuidv4(),
        name: 'New column',
        isPrimary: false,
        type: 'int',
        uniqueKeys: '',
        height: defaultRowHeight,
        leftPointId: uuidv4(),
        rightPointId: uuidv4(),
      };
      if (!shape.dbColumns) {
        shape.dbColumns = [];
      }
      shape.dbColumns.push(col);
      return dbColumnInit(col);
    },
    findColumn(colId) {
      if (!shape.dbColumns) {
        shape.dbColumns = [];
      }
      const colIndex = shape.dbColumns.findIndex((col) => col.id === colId);
      return dbColumnInit(shape.dbColumns[colIndex]);
    },
    getColumns() {
      if (!shape.dbColumns) {
        shape.dbColumns = [];
      }
      return shape.dbColumns;
    },
  };
}

export interface DiagramController {
  getShapes: () => Shape[],
  findShape: (shapeId: string) => ShapeController,
  findTable: (tableId: string) => DbTableController,
  addTable: (x: number, y: number) => DbTableController,
}

export function diagramInit(defDiagram?: Diagram): DiagramController {
  const diagram: Diagram = defDiagram ?? { shapes: [], lines: [] };

  return {
    getShapes() {
      return diagram.shapes;
    },
    findShape(shapeId: string): ShapeController {
      const shapeIndex = diagram.shapes.findIndex((shape) => shape.id === shapeId);
      return shapeInit(diagram.shapes[shapeIndex]);
    },
    findTable(tableId): DbTableController {
      const tableIndex = diagram.shapes.findIndex(
        (shape) => shape.id === tableId && shape.type === 'dbTable',
      );
      return dbTableInit(diagram.shapes[tableIndex]);
    },
    addTable(x, y) {
      const dbTable: Shape = {
        id: uuidv4(),
        type: 'dbTable',
        x,
        y,
        title: 'Table name',
        width: 0,
        height: 0,
        dbColumns: [],
      };
      diagram.shapes.push(dbTable);
      return dbTableInit(dbTable);
    },
  };
}

const test = diagramInit();

test.findShape('ad').setX(2);

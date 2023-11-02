class GraphNode<T> {
  data: T;

  // eslint-disable-next-line no-use-before-define
  adjacents: GraphNode<T>[] = [];

  comparator: (value1: T, value2: T) => number;

  constructor(data: T, comparator: (value1: T, value2: T) => number) {
    this.data = data;
    this.comparator = comparator;
  }

  public addAdjacent(node: GraphNode<T>) {
    this.adjacents.push(node);
  }

  public removeAdjacent(data: T): GraphNode<T> | null {
    const index = this.adjacents.findIndex((node) => this.comparator(node.data, data));
    if (index === -1) {
      return null;
    }
    return this.adjacents.splice(index, 1)[0];
  }
}

class Graph<T> {
  root: GraphNode<T>;

  nodes: Map<T, GraphNode<T>> = new Map<T, GraphNode<T>>();

  comparator: (value1: T, value2: T) => number;

  constructor(data: T, comparator: (value1: T, value2: T) => number) {
    this.root = new GraphNode<T>(data, comparator);
    this.comparator = comparator;
  }

  public add(data: T): GraphNode<T> {
    const existNode = this.nodes.get(data);
    if (existNode) {
      return existNode;
    }
    const newNode = new GraphNode(data, this.comparator);
    this.nodes.set(data, newNode);
    return newNode;
  }

  public remove(data: T) {
    const targetNode = this.nodes.get(data);
    if (!targetNode) {
      return null;
    }
    this.nodes.forEach((node) => {
      node.removeAdjacent(targetNode.data);
    });
    this.nodes.delete(data);
    return targetNode;
  }

  public addEdge(from: T, to: T) {
    const fromNode = this.add(from);
    const toNode = this.add(to);
    fromNode.addAdjacent(toNode);
  }

  public removeEdge(from: T, to: T) {
    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);

    if (fromNode && toNode) {
      fromNode.removeAdjacent(to);
    }
  }

  private dfs(visitMap: Map<T, boolean>, node: GraphNode<T>) {
    visitMap.set(node.data, true);
    node.adjacents.forEach((adj) => {
      if (!visitMap.has(adj.data)) {
        this.dfs(visitMap, adj);
      }
    });
  }

  public startDfs() {
    const visitMap = new Map<T, boolean>();
    this.nodes.forEach((node) => {
      if (!visitMap.has(node.data)) {
        this.dfs(visitMap, node);
      }
    });
  }
}

interface Rectangle {
  x: number,
  y: number,
  width: number,
  height: number,
}

/**
 * Boundary of a rectangle (Every properties in this class is read only)
 */
class Boundary {
  /**
   * x coordinate of starting point
   */
  readonly x: number;

  /**
   * y coordinate of starting point
   */
  readonly y: number;

  /**
   * Boundary width
   */
  readonly width: number;

  /**
   * Boundary height
   */
  readonly height: number;

  /**
   * x coordiate of bottom right corner
   */
  public get x2() {
    return this.x + this.width;
  }

  /**
   * y coordiate of bottom right corner
   */
  public get y2() {
    return this.y + this.height;
  }

  private constructor(attributes: {
    x: number, y: number, width: number, height: number,
  }) {
    const {
      x, y, width, height,
    } = attributes;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  static create(rect: Rectangle): Boundary {
    const {
      x, y, width, height,
    } = rect;
    return new Boundary({
      x,
      y,
      width,
      height,
    });
  }

  static createByAttributes(attributes: {
    x: number, y: number, width: number, height: number,
  }): Boundary {
    const {
      x, y, width, height,
    } = attributes;
    return new Boundary({
      x,
      y,
      width,
      height,
    });
  }

  /**
   * Expand current boundary by specific margin(This will not modify current object)
   * @param borderWidth How much do you want to expand
   * @returns New boundary object that is expanded based on current boundary
   */
  public expand(borderWidth: number) {
    return Boundary.createByAttributes({
      x: this.x - borderWidth,
      y: this.y - borderWidth,
      width: this.width + borderWidth,
      height: this.height + borderWidth,
    });
  }

  /**
   * Check is input boundary has collision
   * @param boundary Target boundary you want to check
   * @returns true if collision found. Vise versa
   */
  public collideWidth(boundary: Boundary): boolean {
    return (boundary.x < this.x + this.width)
    && (this.x < (boundary.x + boundary.width))
    && (boundary.y < this.y + this.height)
    && (this.y < boundary.y + boundary.height);
  }

  /**
   * Create a union boundary based on current and input boundary
   * (This will not modify current object)
   * @param boundary Target boundary you want to union
   * @returns Union boundary
   */
  public union(boundary: Boundary): Boundary {
    return Boundary.createByAttributes({
      x: Math.min(this.x, this.x2, boundary.x, boundary.x2),
      y: Math.min(this.y, this.y2, boundary.y, boundary.y2),
      width: Math.max(this.x, this.x2, boundary.x, boundary.x2),
      height: Math.max(this.y, this.y2, boundary.y, boundary.y2),
    });
  }
}

class Grid {
  private rows = 0;

  private columns = 0;

  /**
   * The outer map key is row number, inner map key is column number
   */
  readonly grid = new Map<number, Map<number, Boundary>>();

  get columnCount(): number {
    return this.columns;
  }

  get rowCount(): number {
    return this.rows;
  }

  /**
   * Set a boundary to grid
   * @param row Target row number
   * @param column Target column number
   * @param boundary The boundary you want to add
   */
  public set(row: number, column: number, boundary: Boundary) {
    this.rows = Math.max(this.rows, row + 1);
    this.columns = Math.max(this.columns, column + 1);

    const rowMap = this.grid.get(row) || this.grid.set(row, new Map()).get(row);

    if (rowMap) {
      rowMap.set(column, boundary);
    }
  }

  /**
   * Get a boundary from grid
   * @param row Target row number
   * @param column Target column number
   * @returns The boundary at that location(null if not exist)
   */
  public get(row: number, column: number): Boundary | null {
    const rowMap = this.grid.get(row);

    if (rowMap) {
      return rowMap.get(column) || null;
    }

    return null;
  }
}

interface Point {
  x: number,
  y: number,
}

interface PointData {
  orient: number;
  point: Point;
}

interface PathFindingInfo {
  blocks: Rectangle[],
  fromPoint: PointData,
  toPoint: PointData,
  blockMargin: number;
  globalBoundsMargin: number;
  globalBounds: Rectangle;
}

function hasCollision(boundarys: Boundary[]): boolean {
  for (let i = 1; i < boundarys.length - 1; i += 1) {
    for (let j = i; j < boundarys.length; j += 1) {
      if (boundarys[i - 1].collideWidth(boundarys[j])) {
        return true;
      }
    }
  }
  return false;
}

export function findPath(info: PathFindingInfo) {
  const {
    blocks, fromPoint, toPoint, globalBounds, globalBoundsMargin,
  } = info;
  const dots: Point[] = [];
  const verticalRulers: number[] = [];
  const horizontalRulers: number[] = [];
  const isFromVertical = fromPoint.orient === 0 || fromPoint.orient === 180;
  const isToVertical = toPoint.orient === 0 || toPoint.orient === 180;
  const { blockMargin } = info;

  const boundaries = blocks.map((block) => Boundary.create(block));
  const expandedBoundaries = boundaries.map((boundary) => boundary.expand(blockMargin));

  const isCollided = hasCollision(expandedBoundaries);

  const finalBoundaries = isCollided ? boundaries : expandedBoundaries;

  const finalBlockMargin = isCollided ? 0 : blockMargin;

  const expandedUnionBoundary = finalBoundaries.reduce(
    (sumBoundary, currentBoundary) => sumBoundary.union(currentBoundary),
    finalBoundaries[0],
  ).expand(globalBoundsMargin);

  const outerBoundary = Boundary.create(globalBounds);

  // Curated bounds to stick to
  const finalOuterBoundary = Boundary.createByAttributes({
    x: Math.max(expandedUnionBoundary.x, outerBoundary.x),
    y: Math.max(expandedUnionBoundary.y, outerBoundary.y),
    width: Math.min(expandedUnionBoundary.x2, outerBoundary.x2),
    height: Math.min(expandedUnionBoundary.y2, outerBoundary.y2),
  });

  // Add edges to rulers
  finalBoundaries.forEach((boundary) => {
    verticalRulers.push(boundary.x);
    verticalRulers.push(boundary.x2);
    horizontalRulers.push(boundary.y);
    horizontalRulers.push(boundary.y2);
  });

  // Rulers at origins of shapes
  (isFromVertical ? verticalRulers : horizontalRulers)
    .push(isFromVertical ? fromPoint.point.x : fromPoint.point.y);
  (isToVertical ? verticalRulers : horizontalRulers)
    .push(isToVertical ? toPoint.point.x : toPoint.point.y);

  // Points of shape antennas
  [fromPoint, toPoint].forEach((pointData) => {
    const { point } = pointData;
    const add = (dx: number, dy: number) => dots.push({
      x: point.x + dx,
      y: point.y + dy,
    });

    switch (pointData.orient) {
      case 0: add(0, -finalBlockMargin); break;
      case 90: add(finalBlockMargin, 0); break;
      case 180: add(0, finalBlockMargin); break;
      case 270: add(-finalBlockMargin, 0); break;
      default: add(0, -finalBlockMargin); break;
    }
  });

  // Sort rulers
  verticalRulers.sort((a, b) => a - b);
  horizontalRulers.sort((a, b) => a - b);
}

interface Edge<T> {
  node: T,
  weight: number,
}

class GraphNode<T> {
  data: T;

  // eslint-disable-next-line no-use-before-define
  adjacents: Edge<GraphNode<T>>[] = [];

  // eslint-disable-next-line no-use-before-define
  shortestPath: GraphNode<T>[] = [];

  weight = Number.MAX_SAFE_INTEGER;

  comparator: (value1: T, value2: T) => number;

  constructor(data: T, comparator: (value1: T, value2: T) => number, weight?: number) {
    this.data = data;
    // this.weight = weight ?? 0;
    this.comparator = comparator;
  }

  public addAdjacent(node: GraphNode<T>, weight: number) {
    this.adjacents.push({
      node,
      weight,
    });
  }

  public removeAdjacent(data: T): GraphNode<T> | null {
    const index = this.adjacents.findIndex((edge) => this.comparator(edge.node.data, data) === 0);
    if (index === -1) {
      return null;
    }
    return this.adjacents.splice(index, 1)[0].node;
  }
}

class Graph<T> {
  // nodes: Map<T, GraphNode<T>> = new Map<T, GraphNode<T>>();
  readonly nodes: GraphNode<T>[] = [];

  comparator: (value1: T, value2: T) => number;

  constructor(comparator: (value1: T, value2: T) => number) {
    this.comparator = comparator;
  }

  public add(data: T): GraphNode<T> {
    const existNode = this.find(data);
    if (existNode) {
      return existNode;
    }
    const newNode = new GraphNode(data, this.comparator);
    this.nodes.push(newNode);
    return newNode;
  }

  public remove(data: T) {
    const targetIndex = this.findIndex(data);
    if (targetIndex === -1) {
      return null;
    }
    const targetNode = this.nodes.splice(targetIndex, 1)[0];
    this.nodes.forEach((node) => {
      node.removeAdjacent(targetNode.data);
    });
    return targetNode;
  }

  public addEdge(from: T, to: T, weight: number) {
    const fromNode = this.add(from);
    const toNode = this.add(to);
    fromNode.addAdjacent(toNode, weight);
  }

  public removeEdge(from: T, to: T) {
    const fromNode = this.find(from);
    const toNode = this.find(to);

    if (fromNode && toNode) {
      fromNode.removeAdjacent(to);
    }
  }

  public find(data: T) {
    return this.nodes.find((node) => this.comparator(node.data, data) === 0);
  }

  public findIndex(data: T) {
    return this.nodes.findIndex((node) => this.comparator(node.data, data) === 0);
  }

  public has(data: T): boolean {
    return !!this.find(data);
  }

  private dfs(visitMap: Map<T, boolean>, node: GraphNode<T>) {
    visitMap.set(node.data, true);
    node.adjacents.forEach((edge) => {
      if (!visitMap.has(edge.node.data)) {
        this.dfs(visitMap, edge.node);
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

interface Point {
  x: number,
  y: number,
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
    x: number, y: number, x2: number, y2: number,
  }): Boundary {
    const {
      x, y, x2, y2,
    } = attributes;
    return new Boundary({
      x,
      y,
      width: x2 - x,
      height: y2 - y,
    });
  }

  public contains(p: Point): boolean {
    return p.x >= this.x && p.x <= this.x2 && p.y >= this.y && p.y <= this.y2;
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
      x2: this.x2 + borderWidth,
      y2: this.y2 + borderWidth,
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
      x2: Math.max(this.x, this.x2, boundary.x, boundary.x2),
      y2: Math.max(this.y, this.y2, boundary.y, boundary.y2),
    });
  }

  get center(): Point {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }

  get topRight(): Point {
    return { x: this.x2, y: this.y };
  }

  get bottomRight(): Point {
    return { x: this.x2, y: this.y2 };
  }

  get bottomLeft(): Point {
    return { x: this.x, y: this.y2 };
  }

  get topLeft(): Point {
    return { x: this.x, y: this.y };
  }

  get right(): Point {
    return { x: this.x2, y: this.center.y };
  }

  get top(): Point {
    return { x: this.center.x, y: this.y };
  }

  get bottom(): Point {
    return { x: this.center.x, y: this.y2 };
  }

  get left(): Point {
    return { x: this.x, y: this.center.y };
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

  public toPoints(boundaries: Boundary[]): Point[] {
    const points: Point[] = [];

    this.grid.forEach((rows, rowIndex) => {
      const isFirstRow = rowIndex === 0;
      const isLastRow = rowIndex === this.rows - 1;

      rows.forEach((boundary, columnIndex) => {
        const isFirstColumn = columnIndex === 0;
        const isLastColumn = columnIndex === this.columns - 1;
        const topLeft = isFirstRow && isFirstColumn;
        const topRight = isFirstRow && isLastColumn;
        const bottomLeft = isLastRow && isLastColumn;
        const bottomRight = isLastRow && isFirstColumn;

        if (topLeft || topRight || bottomLeft || bottomRight) {
          points.push(
            boundary.topLeft,
            boundary.topRight,
            boundary.bottomLeft,
            boundary.bottomRight,
          );
        } else if (isFirstRow) {
          points.push(boundary.topLeft, boundary.top, boundary.topRight);
        } else if (isLastRow) {
          points.push(boundary.bottomRight, boundary.bottom, boundary.bottomLeft);
        } else if (isFirstColumn) {
          points.push(boundary.topLeft, boundary.left, boundary.bottomLeft);
        } else if (isLastColumn) {
          points.push(boundary.topRight, boundary.right, boundary.bottomRight);
        } else {
          points.push(
            boundary.topLeft,
            boundary.top,
            boundary.topRight,
            boundary.right,
            boundary.bottomRight,
            boundary.bottom,
            boundary.bottomLeft,
            boundary.left,
            boundary.center,
          );
        }
      });
    });

    const obstacleCollision = (p: Point) => boundaries.filter((o) => o.contains(p)).length > 0;

    const result = Grid.reducePoints(points).filter((p) => !obstacleCollision(p));

    return result;
  }

  private static reducePoints(points: Point[]): Point[] {
    const result: Point[] = [];
    const map = new Map<number, number[]>();

    points.forEach((point) => {
      const { x, y } = point;
      const arr = map.get(y) || map.set(y, []).get(y);

      if (arr && arr.indexOf(x) < 0) {
        arr.push(x);
      }
    });

    map.forEach((xs, y) => {
      xs.forEach((x) => {
        result.push({ x, y });
      });
    });

    return result;
  }
}

class Rulers {
  private readonly verticals: number[] = [];

  private readonly horizontals: number[] = [];

  public addVertical(x: number) {
    this.verticals.push(x);
  }

  public addHorizontal(y: number) {
    this.horizontals.push(y);
  }

  public addBoundary(boundary: Boundary) {
    this.verticals.push(boundary.x);
    this.verticals.push(boundary.x2);
    this.horizontals.push(boundary.y);
    this.horizontals.push(boundary.y2);
  }

  public toGrid(boundary: Boundary): Grid {
    const grid = new Grid();

    this.verticals.sort((a, b) => a - b);
    this.horizontals.sort((a, b) => a - b);

    let previousX = boundary.x;
    let previousY = boundary.y;
    this.horizontals.forEach((y, row) => {
      this.verticals.forEach((x, column) => {
        grid.set(row, column, Boundary.createByAttributes({
          x: previousX,
          y: previousY,
          x2: x,
          y2: y,
        }));
        previousX = x;
      });

      // Add last cell of the row
      grid.set(row, this.verticals.length, Boundary.createByAttributes({
        x: previousX,
        y: previousY,
        x2: boundary.x2,
        y2: y,
      }));
      previousX = boundary.x;
      previousY = y;
    });

    // Last row of cells
    this.verticals.forEach((x, column) => {
      grid.set(this.horizontals.length, column, Boundary.createByAttributes({
        x: previousX,
        y: previousY,
        x2: x,
        y2: boundary.y2,
      }));
      previousX = x;
    });

    // Last cell of last row
    grid.set(
      this.horizontals.length,
      this.verticals.length,
      Boundary.createByAttributes({
        x: previousX,
        y: previousY,
        x2: boundary.x2,
        y2: boundary.y2,
      }),
    );

    return grid;
  }
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

/**
 * Parse angle degree to radian
 * @param degrees The degree you want to parse
 */
function toRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

/**
 * Rotate 2d vector with rotation matrix
 * @param vector target vector
 * @param radians rotate radians
 */
function rotate2dVector(vector: number[], radians: number) {
  const newVector: number[] = [];
  const x = vector[0] * Math.cos(radians) - vector[1] * Math.sin(radians);
  const y = vector[0] * Math.sin(radians) + vector[1] * Math.cos(radians);

  newVector.push(x, y);
  return newVector;
}

/**
 * Computes distance between two points
 * @param a
 * @param b
 */
function distance(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

function createGraph(points: Point[]): Graph<Point> {
  const graph = new Graph<Point>((a, b) => ((a.x === b.x && a.y === b.y) ? 0 : 1));

  const hotXs: number[] = [];
  const hotYs: number[] = [];
  points.forEach((point) => {
    const { x, y } = point;
    if (hotXs.indexOf(x) < 0) hotXs.push(x);
    if (hotYs.indexOf(y) < 0) hotYs.push(y);
    graph.add(point);
  });

  hotXs.sort((a, b) => a - b);
  hotYs.sort((a, b) => a - b);

  const inHotIndex = (p: Point): boolean => graph.has(p);

  for (let i = 0; i < hotYs.length; i += 1) {
    for (let j = 0; j < hotXs.length; j += 1) {
      const b: Point = {
        x: hotXs[j],
        y: hotYs[i],
      };

      // eslint-disable-next-line no-continue
      if (!inHotIndex(b)) continue;

      if (j > 0) {
        const a: Point = {
          x: hotXs[j - 1],
          y: hotYs[i],
        };

        if (inHotIndex(a)) {
          graph.addEdge(a, b, distance(a, b));
          graph.addEdge(b, a, distance(a, b));
        }
      }

      if (i > 0) {
        const a: Point = {
          x: hotXs[j],
          y: hotYs[i - 1],
        };

        if (inHotIndex(a)) {
          graph.addEdge(a, b, distance(a, b));
          graph.addEdge(b, a, distance(a, b));
        }
      }
    }
  }
  return graph;
}

function getLowestDistanceNode(unsettledNodes: Set<GraphNode<Point>>): GraphNode<Point> {
  let lowestDistanceNode: GraphNode<Point> = {} as GraphNode<Point>;
  let lowestDistance = Number.MAX_SAFE_INTEGER;
  unsettledNodes.forEach((node) => {
    const nodeDistance = node.weight;
    if (nodeDistance < lowestDistance) {
      lowestDistance = nodeDistance;
      lowestDistanceNode = node;
    }
  });
  return lowestDistanceNode;
}

function calculateMinimumDistance(
  evaluationNode: GraphNode<Point>,
  edgeWeigh: number,
  sourceNode: GraphNode<Point>,
) {
  const sourceDistance = sourceNode.weight;
  /* const comingDirection = PointGraph.inferPathDirection(sourceNode);
  const goingDirection = PointGraph.directionOfNodes(sourceNode, evaluationNode);
  const changingDirection = comingDirection
    && goingDirection && comingDirection !== goingDirection;
  const extraWeigh = changingDirection ? (edgeWeigh + 1) ** 2 : 0; */
  const extraWeigh = 0;

  if (sourceDistance + edgeWeigh + extraWeigh < evaluationNode.weight) {
    evaluationNode.weight = sourceDistance + edgeWeigh + extraWeigh;
    const shortestPath: GraphNode<Point>[] = [...sourceNode.shortestPath];
    shortestPath.push(sourceNode);
    evaluationNode.shortestPath = shortestPath;
  }
}

function calculateShortestPathFromSource(
  graph: Graph<Point>,
  source: GraphNode<Point>,
): Graph<Point> {
  source.weight = 0;

  const settledNodes: Set<GraphNode<Point>> = new Set();
  const unsettledNodes: Set<GraphNode<Point>> = new Set();

  unsettledNodes.add(source);

  while (unsettledNodes.size !== 0) {
    const currentNode = getLowestDistanceNode(unsettledNodes);
    unsettledNodes.delete(currentNode);

    currentNode.adjacents.forEach((edge) => {
      if (settledNodes.has(edge.node)) {
        return;
      }
      calculateMinimumDistance(edge.node, edge.weight, currentNode);
      unsettledNodes.add(edge.node);
    });

    settledNodes.add(currentNode);
  }

  return graph;
}

function getShortestPath(graph: Graph<Point>, origin: Point, destination: Point): Point[] {
  const originNode = graph.find(origin);
  const destinationNode = graph.find(destination);

  if (!originNode) {
    throw new Error(`Origin node {${origin.x},${origin.y}} not found`);
  }

  if (!destinationNode) {
    throw new Error(`Origin node {${origin.x},${origin.y}} not found`);
  }

  calculateShortestPathFromSource(graph, originNode);

  return destinationNode.shortestPath.map((n) => n.data);
}

export function findOrthogonalPath(info: PathFindingInfo) {
  const {
    blocks, fromPoint, toPoint, globalBounds, globalBoundsMargin,
  } = info;
  const points: Point[] = [];
  const rulers = new Rulers();
  const { blockMargin } = info;

  const boundaries = blocks.map((block) => Boundary.create(block));
  const expandedBoundaries = boundaries.map((boundary) => boundary.expand(blockMargin));
  /* const boundaryA = Boundary.create(blockA);
  const boundaryB = Boundary.create(blockB);

  let expandedA = boundaryA.expand(blockMargin);
  let expandedB = boundaryB.expand(blockMargin);

  // Check bounding boxes collision
  if (expandedA.collideWidth(expandedB)) {
    blockMargin = 0;
    expandedA = boundaryA;
    expandedB = boundaryB;
  }

  const expandedUnionBoundary = expandedA
    .union(expandedB)
    .expand(globalBoundsMargin);

  const outerBoundary = Boundary.create(globalBounds);
  // Curated bounds to stick to
  const bounds = Boundary.createByAttributes({
    x: Math.max(expandedUnionBoundary.x, outerBoundary.x),
    y: Math.max(expandedUnionBoundary.y, outerBoundary.y),
    x2: Math.min(expandedUnionBoundary.x2, outerBoundary.x2),
    y2: Math.min(expandedUnionBoundary.y2, outerBoundary.y2),
  });

  // Add edges to rulers
  [expandedA, expandedB].forEach((b) => {
    rulers.addBoundary(b);
  }); */

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
    x2: Math.min(expandedUnionBoundary.x2, outerBoundary.x2),
    y2: Math.min(expandedUnionBoundary.y2, outerBoundary.y2),
  });

  // Add edges to rulers
  finalBoundaries.forEach((boundary) => {
    rulers.addBoundary(boundary);
  });

  // Rulers at starting and ending point
  const isFromVertical = fromPoint.orient === 0 || fromPoint.orient === 180;
  const isToVertical = toPoint.orient === 0 || toPoint.orient === 180;

  if (isFromVertical) {
    rulers.addVertical(fromPoint.point.x);
  } else {
    rulers.addHorizontal(fromPoint.point.y);
  }

  if (isToVertical) {
    rulers.addVertical(toPoint.point.x);
  } else {
    rulers.addHorizontal(toPoint.point.y);
  }

  // Points of shape antennas
  [fromPoint, toPoint].forEach((pointData) => {
    const { point } = pointData;
    const add = (dx: number, dy: number) => points.push({
      x: point.x + dx,
      y: point.y + dy,
    });

    switch (pointData.orient) {
      case 0: add(0, -finalBlockMargin); break;
      case 90: add(finalBlockMargin, 0); break;
      case 180: add(0, finalBlockMargin); break;
      case 270: add(-finalBlockMargin, 0); break;
      default: throw new Error(`Invalid orient: ${pointData.orient}`);
    }
  });

  // Sort rulers
  const grid = rulers.toGrid(finalOuterBoundary);
  const gridPoints = grid.toPoints(finalBoundaries);

  points.push(...gridPoints);

  const graph = createGraph(points);

  const fromVector = rotate2dVector([0, -finalBlockMargin], toRadians(fromPoint.orient));
  const fromExtrudePoint = {
    x: fromPoint.point.x + fromVector[0],
    y: fromPoint.point.y + fromVector[1],
  };

  const toVector = rotate2dVector([0, -finalBlockMargin], toRadians(toPoint.orient));
  const toExtrudePoint = {
    x: toPoint.point.x + toVector[0],
    y: toPoint.point.y + toVector[1],
  };

  const path = getShortestPath(graph, fromExtrudePoint, toExtrudePoint);
  console.log(path.length);

  return points;
}

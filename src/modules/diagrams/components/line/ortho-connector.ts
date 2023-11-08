/**
 * Orthogonal Connector Router
 *   - Given two rectangles and their connection points,
 *     returns the path for an orthogonal connector.
 *
 * https://jose.page
 * 2020
 */
type Direction = 'v' | 'h';
type Side = 'top' | 'right' | 'bottom' | 'left';
type BendDirection = 'n' | 'e' | 's' | 'w' | 'unknown' | 'none';

/**
 * A point in space
 */
interface Point {
  x: number;
  y: number;
}

/**
 * A line between two points
 */
interface Line{
  a: Point;
  b: Point;
}

/**
 * Represents a Rectangle by location and size
 */
interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Represents a connection point on a routing request
 */
interface ConnectorPoint {
  shape: Rect;
  side: Side;
  distance: number;
}

/**
 * Utility Point creator
 * @param x
 * @param y
 */
function makePt(x: number, y: number): Point {
  return { x, y };
}

/**
 * Abstracts a Rectangle and adds geometric utilities
 */
class Rectangle {
  static get empty(): Rectangle {
    return new Rectangle(0, 0, 0, 0);
  }

  static fromRect(r: Rect): Rectangle {
    return new Rectangle(r.left, r.top, r.width, r.height);
  }

  static fromLTRB(left: number, top: number, right: number, bottom: number): Rectangle {
    return new Rectangle(left, top, right - left, bottom - top);
  }

  // eslint-disable-next-line max-len, no-useless-constructor
  constructor(readonly left: number, readonly top:number, readonly width: number, readonly height: number) {
    //
  }

  contains(p: Point): boolean {
    return p.x >= this.left && p.x <= this.right && p.y >= this.top && p.y <= this.bottom;
  }

  inflate(horizontal: number, vertical: number): Rectangle {
    return Rectangle
      .fromLTRB(
        this.left - horizontal,
        this.top - vertical,
        this.right + horizontal,
        this.bottom + vertical,
      );
  }

  intersects(rectangle: Rectangle): boolean {
    const thisX = this.left;
    const thisY = this.top;
    const thisW = this.width;
    const thisH = this.height;
    const rectX = rectangle.left;
    const rectY = rectangle.top;
    const rectW = rectangle.width;
    const rectH = rectangle.height;
    return (rectX < thisX + thisW)
      && (thisX < (rectX + rectW))
      && (rectY < thisY + thisH)
      && (thisY < rectY + rectH);
  }

  union(r: Rectangle): Rectangle {
    const x = [this.left, this.right, r.left, r.right];
    const y = [this.top, this.bottom, r.top, r.bottom];
    return Rectangle.fromLTRB(
      Math.min(...x),
      Math.min(...y),
      Math.max(...x),
      Math.max(...y),
    );
  }

  get center(): Point {
    return {
      x: this.left + this.width / 2,
      y: this.top + this.height / 2,
    };
  }

  get right(): number {
    return this.left + this.width;
  }

  get bottom(): number {
    return this.top + this.height;
  }

  get location(): Point {
    return makePt(this.left, this.top);
  }

  get northEast(): Point {
    return { x: this.right, y: this.top };
  }

  get southEast(): Point {
    return { x: this.right, y: this.bottom };
  }

  get southWest(): Point {
    return { x: this.left, y: this.bottom };
  }

  get northWest(): Point {
    return { x: this.left, y: this.top };
  }

  get east(): Point {
    return makePt(this.right, this.center.y);
  }

  get north(): Point {
    return makePt(this.center.x, this.top);
  }

  get south(): Point {
    return makePt(this.center.x, this.bottom);
  }

  get west(): Point {
    return makePt(this.left, this.center.y);
  }
}

/**
 * Byproduct data emitted by the routing algorithm
 */
interface OrthogonalConnectorByproduct{
  hRulers: number[];
  vRulers: number[];
  spots: Point[];
  grid: Rectangle[];
  connections: Line[];
}

/**
 * Routing request data
 */
interface OrthogonalConnectorOpts {
  pointA: ConnectorPoint;
  pointB: ConnectorPoint;
  shapeMargin: number;
  globalBoundsMargin: number;
  globalBounds: Rect;
}

/**
 * Computes distance between two points
 * @param a
 * @param b
 */
function distance(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

/**
 * Represents a node in a graph, whose data is a Point
 */
class PointNode {
  public distance = Number.MAX_SAFE_INTEGER;

  // eslint-disable-next-line no-use-before-define
  public shortestPath: PointNode[] = [];

  // eslint-disable-next-line no-use-before-define
  public adjacentNodes: Map<PointNode, number> = new Map();

  // eslint-disable-next-line no-useless-constructor
  constructor(public data: Point) {
    //
  }
}

/**
 * Represents a Graph of Point nodes
 */
class PointGraph {
  private index: {[x: string]: {[y: string]: PointNode}} = {};

  add(p: Point) {
    const { x, y } = p;
    const xs = x.toString();
    const ys = y.toString();

    if (!(xs in this.index)) {
      this.index[xs] = {};
    }
    if (!(ys in this.index[xs])) {
      this.index[xs][ys] = new PointNode(p);
    }
  }

  static getLowestDistanceNode(unsettledNodes: Set<PointNode>): PointNode {
    let lowestDistanceNode: PointNode = {} as PointNode;
    let lowestDistance = Number.MAX_SAFE_INTEGER;
    unsettledNodes.forEach((node) => {
      const nodeDistance = node.distance;
      if (nodeDistance < lowestDistance) {
        lowestDistance = nodeDistance;
        lowestDistanceNode = node;
      }
    });
    return lowestDistanceNode;
  }

  static inferPathDirection(node: PointNode): Direction | null {
    if (node.shortestPath.length === 0) {
      return null;
    }

    return PointGraph.directionOfNodes(node.shortestPath[node.shortestPath.length - 1], node);
  }

  static calculateShortestPathFromSource(graph: PointGraph, source: PointNode): PointGraph {
    source.distance = 0;

    const settledNodes: Set<PointNode> = new Set();
    const unsettledNodes: Set<PointNode> = new Set();

    unsettledNodes.add(source);

    while (unsettledNodes.size !== 0) {
      const currentNode = PointGraph.getLowestDistanceNode(unsettledNodes);
      unsettledNodes.delete(currentNode);

      currentNode.adjacentNodes.forEach((edgeWeight, adjacentNode) => {
        if (!settledNodes.has(adjacentNode)) {
          PointGraph.calculateMinimumDistance(adjacentNode, edgeWeight, currentNode);
          unsettledNodes.add(adjacentNode);
        }
      });
      settledNodes.add(currentNode);
    }

    return graph;
  }

  static calculateMinimumDistance(
    evaluationNode: PointNode,
    edgeWeigh: number,
    sourceNode: PointNode,
  ) {
    const sourceDistance = sourceNode.distance;
    const comingDirection = PointGraph.inferPathDirection(sourceNode);
    const goingDirection = PointGraph.directionOfNodes(sourceNode, evaluationNode);
    const changingDirection = comingDirection
      && goingDirection && comingDirection !== goingDirection;
    const extraWeigh = changingDirection ? (edgeWeigh + 1) ** 2 : 0;

    if (sourceDistance + edgeWeigh + extraWeigh < evaluationNode.distance) {
      evaluationNode.distance = sourceDistance + edgeWeigh + extraWeigh;
      const shortestPath: PointNode[] = [...sourceNode.shortestPath];
      shortestPath.push(sourceNode);
      evaluationNode.shortestPath = shortestPath;
    }
  }

  static directionOf(a: Point, b: Point): Direction | null {
    if (a.x === b.x) {
      return 'h';
    }
    if (a.y === b.y) {
      return 'v';
    }
    return null;
  }

  static directionOfNodes(a: PointNode, b: PointNode): Direction | null {
    return PointGraph.directionOf(a.data, b.data);
  }

  connect(a: Point, b: Point) {
    const nodeA = this.get(a);
    const nodeB = this.get(b);

    if (!nodeA || !nodeB) {
      throw new Error('A point was not found');
    }

    nodeA.adjacentNodes.set(nodeB, distance(a, b));
  }

  has(p: Point): boolean {
    const { x, y } = p;
    const xs = x.toString();
    const ys = y.toString();
    return xs in this.index && ys in this.index[xs];
  }

  get(p: Point): PointNode | null {
    const { x, y } = p;
    const xs = x.toString();
    const ys = y.toString();

    if (xs in this.index && ys in this.index[xs]) {
      return this.index[xs][ys];
    }

    return null;
  }
}

/**
 * Gets the actual point of the connector based on the distance parameter
 * @param p
 */
function computePt(p: ConnectorPoint): Point {
  const b = Rectangle.fromRect(p.shape);
  switch (p.side) {
    case 'bottom': return makePt(b.left + b.width * p.distance, b.bottom);
    case 'top': return makePt(b.left + b.width * p.distance, b.top);
    case 'left': return makePt(b.left, b.top + b.height * p.distance);
    case 'right': return makePt(b.right, b.top + b.height * p.distance);
    default: return makePt(b.left + b.width * p.distance, b.bottom);
  }
}

/**
 * Extrudes the connector point by margin depending on it's side
 * @param cp
 * @param margin
 */
function extrudeCp(cp: ConnectorPoint, margin: number): Point {
  const { x, y } = computePt(cp);
  switch (cp.side) {
    case 'top': return makePt(x, y - margin);
    case 'right': return makePt(x + margin, y);
    case 'bottom': return makePt(x, y + margin);
    case 'left': return makePt(x - margin, y);
    default: return makePt(x, y - margin);
  }
}

/**
 * Returns flag indicating if the side belongs on a vertical axis
 * @param side
 */
function isVerticalSide(side: Side): boolean {
  return side === 'top' || side === 'bottom';
}

/**
 * Helps create the grid portion of the algorithm
 */
class Grid {
  private _rows = 0;

  private _cols = 0;

  readonly data: Map<number, Map<number, Rectangle>> = new Map();

  // eslint-disable-next-line no-useless-constructor
  constructor() {
    //
  }

  set(row: number, column: number, rectangle: Rectangle) {
    // eslint-disable-next-line no-underscore-dangle
    this._rows = Math.max(this.rows, row + 1);
    // eslint-disable-next-line no-underscore-dangle
    this._cols = Math.max(this.columns, column + 1);

    const rowMap = this.data.get(row) || this.data.set(row, new Map()).get(row);

    if (rowMap) {
      rowMap.set(column, rectangle);
    }
  }

  get(row: number, column: number): Rectangle | null {
    const rowMap = this.data.get(row);

    if (rowMap) {
      return rowMap.get(column) || null;
    }

    return null;
  }

  rectangles(): Rectangle[] {
    const r: Rectangle[] = [];

    this.data.forEach((data) => {
      data.forEach((rect) => {
        r.push(rect);
      });
    });

    return r;
  }

  get columns(): number {
    // eslint-disable-next-line no-underscore-dangle
    return this._cols;
  }

  get rows(): number {
    // eslint-disable-next-line no-underscore-dangle
    return this._rows;
  }
}

/**
 * Creates a grid of rectangles from the specified set of rulers, contained on the specified bounds
 * @param verticals
 * @param horizontals
 * @param bounds
 */
function rulersToGrid(verticals: number[], horizontals: number[], bounds: Rectangle): Grid {
  const result: Grid = new Grid();

  verticals.sort((a, b) => a - b);
  horizontals.sort((a, b) => a - b);

  let lastX = bounds.left;
  let lastY = bounds.top;
  let column = 0;
  let row = 0;

  horizontals.forEach((y) => {
    verticals.forEach((x) => {
      result.set(row, column, Rectangle.fromLTRB(lastX, lastY, x, y));
      column += 1;
      lastX = x;
    });
    // Last cell of the row
    result.set(row, column, Rectangle.fromLTRB(lastX, lastY, bounds.right, y));
    lastX = bounds.left;
    lastY = y;
    column = 0;
    row += 1;
  });

  lastX = bounds.left;

  // Last row of cells
  verticals.forEach((x) => {
    result.set(row, column, Rectangle.fromLTRB(lastX, lastY, x, bounds.bottom));
    column += 1;
    lastX = x;
  });

  // Last cell of last row
  result.set(row, column, Rectangle.fromLTRB(lastX, lastY, bounds.right, bounds.bottom));

  return result;
}

/**
 * Returns an array without repeated points
 * @param points
 */
function reducePoints(points: Point[]): Point[] {
  const result: Point[] = [];
  const map = new Map<number, number[]>();

  points.forEach((p) => {
    const { x, y } = p;
    const arr = map.get(y) || map.set(y, []).get(y);

    if (arr && arr.indexOf(x) < 0) {
      arr.push(x);
    }
  });

  map.forEach((xs, y) => {
    xs.forEach((x) => {
      result.push(makePt(x, y));
    });
  });

  return result;
}

/**
 * Returns a set of spots generated from the grid, avoiding colliding spots with specified obstacles
 * @param grid
 * @param obstacles
 */
function gridToSpots(grid: Grid, obstacles: Rectangle[]): Point[] {
  const obstacleCollision = (p: Point) => obstacles.filter((o) => o.contains(p)).length > 0;

  const gridPoints: Point[] = [];

  grid.data.forEach((data, row) => {
    const firstRow = row === 0;
    const lastRow = row === grid.rows - 1;

    data.forEach((r, col) => {
      const firstCol = col === 0;
      const lastCol = col === grid.columns - 1;
      const nw = firstCol && firstRow;
      const ne = firstRow && lastCol;
      const se = lastRow && lastCol;
      const sw = lastRow && firstCol;

      if (nw || ne || se || sw) {
        gridPoints.push(r.northWest, r.northEast, r.southWest, r.southEast);
      } else if (firstRow) {
        gridPoints.push(r.northWest, r.north, r.northEast);
      } else if (lastRow) {
        gridPoints.push(r.southEast, r.south, r.southWest);
      } else if (firstCol) {
        gridPoints.push(r.northWest, r.west, r.southWest);
      } else if (lastCol) {
        gridPoints.push(r.northEast, r.east, r.southEast);
      } else {
        gridPoints.push(
          r.northWest,
          r.north,
          r.northEast,
          r.east,
          r.southEast,
          r.south,
          r.southWest,
          r.west,
          r.center,
        );
      }
    });
  });

  // for(const r of grid) {
  //     gridPoints.push(
  //         r.northWest, r.north, r.northEast, r.east,
  //         r.southEast, r.south, r.southWest, r.west, r.center);
  // }

  // Reduce repeated points and filter out those who touch shapes
  return reducePoints(gridPoints).filter((p) => !obstacleCollision(p));
}

/**
 * Creates a graph connecting the specified points orthogonally
 * @param spots
 */
function createGraph(spots: Point[]): {graph: PointGraph, connections: Line[]} {
  const hotXs: number[] = [];
  const hotYs: number[] = [];
  const graph = new PointGraph();
  const connections: Line[] = [];

  spots.forEach((p) => {
    const { x, y } = p;
    if (hotXs.indexOf(x) < 0) hotXs.push(x);
    if (hotYs.indexOf(y) < 0) hotYs.push(y);
    graph.add(p);
  });

  hotXs.sort((a, b) => a - b);
  hotYs.sort((a, b) => a - b);

  const inHotIndex = (p: Point): boolean => graph.has(p);

  for (let i = 0; i < hotYs.length; i += 1) {
    for (let j = 0; j < hotXs.length; j += 1) {
      const b = makePt(hotXs[j], hotYs[i]);

      // eslint-disable-next-line no-continue
      if (!inHotIndex(b)) continue;

      if (j > 0) {
        const a = makePt(hotXs[j - 1], hotYs[i]);

        if (inHotIndex(a)) {
          graph.connect(a, b);
          graph.connect(b, a);
          connections.push({ a, b });
        }
      }

      if (i > 0) {
        const a = makePt(hotXs[j], hotYs[i - 1]);

        if (inHotIndex(a)) {
          graph.connect(a, b);
          graph.connect(b, a);
          connections.push({ a, b });
        }
      }
    }
  }

  return { graph, connections };
}

/**
 * Solves the shotest path for the origin-destination path of the graph
 * @param graph
 * @param origin
 * @param destination
 */
function getShortestPath(graph: PointGraph, origin: Point, destination: Point): Point[] {
  const originNode = graph.get(origin);
  const destinationNode = graph.get(destination);

  if (!originNode) {
    throw new Error(`Origin node {${origin.x},${origin.y}} not found`);
  }

  if (!destinationNode) {
    throw new Error(`Origin node {${origin.x},${origin.y}} not found`);
  }

  PointGraph.calculateShortestPathFromSource(graph, originNode);

  return destinationNode.shortestPath.map((n) => n.data);
}

/**
 * Given two segments represented by 3 points,
 * determines if the second segment bends on an orthogonal direction or not, and which.
 *
 * @param a
 * @param b
 * @param c
 * @return Bend direction, unknown if not orthogonal or 'none' if straight line
 */
function getBend(a: Point, b: Point, c: Point): BendDirection {
  const equalX = a.x === b.x && b.x === c.x;
  const equalY = a.y === b.y && b.y === c.y;
  const segment1Horizontal = a.y === b.y;
  const segment1Vertical = a.x === b.x;
  const segment2Horizontal = b.y === c.y;
  const segment2Vertical = b.x === c.x;

  if (equalX || equalY) {
    return 'none';
  }

  if (
    !(segment1Vertical || segment1Horizontal)
    || !(segment2Vertical || segment2Horizontal)
  ) {
    return 'unknown';
  }

  if (segment1Horizontal && segment2Vertical) {
    return c.y > b.y ? 's' : 'n';
  }
  if (segment1Vertical && segment2Horizontal) {
    return c.x > b.x ? 'e' : 'w';
  }

  throw new Error('Nope');
}

/**
 * Simplifies the path by removing unnecessary points, based on orthogonal pathways
 * @param points
 */
function simplifyPath(points: Point[]): Point[] {
  if (points.length <= 2) {
    return points;
  }

  const r: Point[] = [points[0]];
  for (let i = 1; i < points.length; i += 1) {
    const cur = points[i];

    if (i === (points.length - 1)) {
      r.push(cur);
      break;
    }

    const prev = points[i - 1];
    const next = points[i + 1];
    const bend = getBend(prev, cur, next);

    if (bend !== 'none') {
      r.push(cur);
    }
  }
  return r;
}

/**
 * Main logic wrapped in a class to hold a space for potential future functionallity
 */
export class OrthogonalConnector {
  static readonly byproduct: OrthogonalConnectorByproduct = {
    hRulers: [],
    vRulers: [],
    spots: [],
    grid: [],
    connections: [],
  };

  static route(opts: OrthogonalConnectorOpts): Point[] {
    const { pointA, pointB, globalBoundsMargin } = opts;
    const spots: Point[] = [];
    const verticals: number[] = [];
    const horizontals: number[] = [];
    // const sideA = pointA.side;
    const sideAVertical = isVerticalSide(pointA.side);
    // const sideB = pointB.side;
    const sideBVertical = isVerticalSide(pointB.side);
    const originA = computePt(pointA);
    const originB = computePt(pointB);
    const shapeA = Rectangle.fromRect(pointA.shape);
    const shapeB = Rectangle.fromRect(pointB.shape);
    const bigBounds = Rectangle.fromRect(opts.globalBounds);
    let { shapeMargin } = opts;
    let inflatedA = shapeA.inflate(shapeMargin, shapeMargin);
    let inflatedB = shapeB.inflate(shapeMargin, shapeMargin);

    // Check bounding boxes collision
    if (inflatedA.intersects(inflatedB)) {
      shapeMargin = 0;
      inflatedA = shapeA;
      inflatedB = shapeB;
    }

    const inflatedBounds = inflatedA
      .union(inflatedB)
      .inflate(globalBoundsMargin, globalBoundsMargin);

    // Curated bounds to stick to
    const bounds = Rectangle.fromLTRB(
      Math.max(inflatedBounds.left, bigBounds.left),
      Math.max(inflatedBounds.top, bigBounds.top),
      Math.min(inflatedBounds.right, bigBounds.right),
      Math.min(inflatedBounds.bottom, bigBounds.bottom),
    );

    // Add edges to rulers
    [inflatedA, inflatedB].forEach((b) => {
      verticals.push(b.left);
      verticals.push(b.right);
      horizontals.push(b.top);
      horizontals.push(b.bottom);
    });

    // Rulers at origins of shapes
    (sideAVertical ? verticals : horizontals).push(sideAVertical ? originA.x : originA.y);
    (sideBVertical ? verticals : horizontals).push(sideBVertical ? originB.x : originB.y);

    // Points of shape antennas
    [pointA, pointB].forEach((connectorPt) => {
      const p = computePt(connectorPt);
      const add = (dx: number, dy: number) => spots.push(makePt(p.x + dx, p.y + dy));

      switch (connectorPt.side) {
        case 'top': add(0, -shapeMargin); break;
        case 'right': add(shapeMargin, 0); break;
        case 'bottom': add(0, shapeMargin); break;
        case 'left': add(-shapeMargin, 0); break;
        default: add(0, -shapeMargin); break;
      }
    });

    // Sort rulers
    verticals.sort((a, b) => a - b);
    horizontals.sort((a, b) => a - b);

    // Create grid
    const grid = rulersToGrid(verticals, horizontals, bounds);
    const gridPoints = gridToSpots(grid, [inflatedA, inflatedB]);

    // Add to spots
    spots.push(...gridPoints);

    // Create graph
    const { graph, connections } = createGraph(spots);

    // Origin and destination by extruding antennas
    const origin = extrudeCp(pointA, shapeMargin);
    const destination = extrudeCp(pointB, shapeMargin);

    const start = computePt(pointA);
    const end = computePt(pointB);

    this.byproduct.spots = spots;
    this.byproduct.vRulers = verticals;
    this.byproduct.hRulers = horizontals;
    this.byproduct.grid = grid.rectangles();
    this.byproduct.connections = connections;

    const path = getShortestPath(graph, origin, destination);

    if (path.length > 0) {
      return simplifyPath([start, ...getShortestPath(graph, origin, destination), end]);
    }
    return [];
  }
}

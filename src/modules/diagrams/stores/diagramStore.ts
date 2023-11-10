import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ConnectionNode, Diagram, Point } from '../models/shape';

export type HoldType = 'none' | 'connect' | 'reconnect' | 'multiSelect' | 'drag';

type MovedType = 'from' | 'to' | 'none';

interface MouseHoldInfo {
  type: HoldType,
  isHold: boolean,
  movedNode: MovedType,
  holdFrom: Point,
  holdTo: Point,
  holdFromShape?: string,
  holdFromId?: string,
  holdToShape?: string,
  holdToId?: string,
  holdLineId?: string,
}

export interface SelectStructure {
  id: string,
  children: SelectStructure[],
}

export const useDiagramStore = defineStore('diagram', () => {
  const diagram = ref<Diagram>({
    shapes: [],
  });

  const offsetX = ref(0);

  const offsetY = ref(0);

  const holdInfo = ref<MouseHoldInfo>({
    type: 'none',
    isHold: false,
    movedNode: 'none',
    holdFrom: {
      x: 0,
      y: 0,
    },
    holdTo: {
      x: 0,
      y: 0,
    },
  });

  const selectedIds = ref<SelectStructure[]>([]);

  const dragShift = ref<Point>({
    x: 0,
    y: 0,
  });

  const holdType = computed(() => holdInfo.value.type);

  function pointShift(point: Point): Point {
    const shiftedPoint: Point = {
      x: point.x - offsetX.value,
      y: point.y - offsetY.value,
    };
    return shiftedPoint;
  }

  const holdFrom = computed(() => holdInfo.value.holdFrom);

  const holdTo = computed(() => holdInfo.value.holdTo);

  function connectionNode(nodeId: string): ConnectionNode | undefined {
    const targetNode = diagram.value.shapes
      .flatMap((shape) => {
        const nodes: ConnectionNode[] = [];
        nodes.push(...shape.connectionNodes);
        if (shape.dbColumns) {
          nodes.push(...shape.dbColumns.flatMap((col) => col.connectionNodes));
        }
        return nodes;
      })
      .find((node) => node.id === nodeId);
    return targetNode;
  }

  const selectedSquare = computed(
    () => {
      const targetShapes = diagram.value.shapes
        .filter((shape) => selectedIds.value.map((selected) => selected.id).includes(shape.id));
      const minX = Math.min(...targetShapes.map((shape) => shape.position.x));
      const minY = Math.min(...targetShapes.map((shape) => shape.position.y));
      const maxX = Math.max(
        ...targetShapes.map((shape) => shape.position.x + (shape.width ?? 0)),
      );
      const maxY = Math.max(
        ...targetShapes.map((shape) => shape.position.y + (shape.height ?? 0)),
      );
      return {
        x: minX + dragShift.value.x,
        y: minY + dragShift.value.y,
        width: maxX - minX,
        height: maxY - minY,
      };
    },
  );

  function setBoudings(dom: DOMRect) {
    offsetX.value = dom.left;
    offsetY.value = dom.top;
  }

  /**
   * Start connect new line
   * @param x Starting x coordinate
   * @param y Starting y coordinate
   * @param fromId from which node
   * @param shapeId from which shape
   */
  function startConnect(x: number, y: number, fromId: string, shapeId: string) {
    holdInfo.value.holdFrom.x = x;
    holdInfo.value.holdFrom.y = y;
    holdInfo.value.holdFromShape = shapeId;
    holdInfo.value.type = 'connect';
    holdInfo.value.movedNode = 'to';
    holdInfo.value.holdToId = '';
    holdInfo.value.holdLineId = '';
    holdInfo.value.holdToShape = '';
    selectedIds.value.length = 0;
    holdInfo.value.holdFromId = fromId;
  }

  function startReconnectFrom(
    movedType: MovedType,
    lineId: string,
    from: Point,
    to: Point,
    fromId?: string,
    toId?: string,
    fromShape?: string,
    toShape?: string,
  ) {
    holdInfo.value.movedNode = movedType;
    holdInfo.value.holdLineId = lineId;

    holdInfo.value.holdFrom.x = from.x;
    holdInfo.value.holdFrom.y = from.y;

    holdInfo.value.holdTo.x = to.x;
    holdInfo.value.holdTo.y = to.y;

    holdInfo.value.holdFromId = fromId;
    holdInfo.value.holdToId = toId;
    holdInfo.value.holdFromShape = fromShape;
    holdInfo.value.holdToShape = toShape;
    holdInfo.value.type = 'reconnect';
    selectedIds.value.length = 0;
  }

  function startHolding(type: HoldType, x: number, y: number) {
    holdInfo.value.holdFrom.x = x;
    holdInfo.value.holdFrom.y = y;
    holdInfo.value.holdTo.x = x;
    holdInfo.value.holdTo.y = y;
    holdInfo.value.type = type;
    holdInfo.value.holdToId = '';
    holdInfo.value.holdLineId = '';
  }

  function movingByEvent(evt: MouseEvent) {
    if (holdInfo.value.type === 'reconnect' && holdInfo.value.movedNode === 'from') {
      holdInfo.value.holdFrom.x = evt.x - offsetX.value;
      holdInfo.value.holdFrom.y = evt.y - offsetY.value;
    } else {
      holdInfo.value.holdTo.x = evt.x - offsetX.value;
      holdInfo.value.holdTo.y = evt.y - offsetY.value;
    }
  }

  function endHolding() {
    holdInfo.value.type = 'none';
    holdInfo.value.holdFromShape = '';
    holdInfo.value.holdFromId = '';
    holdInfo.value.holdToShape = '';
    holdInfo.value.holdToId = '';
    holdInfo.value.holdLineId = '';
    holdInfo.value.movedNode = 'none';
  }

  function setConnectionNodeId(nodeId: string, shapeId: string) {
    if (holdInfo.value.movedNode === 'from') {
      holdInfo.value.holdFromId = nodeId;
      holdInfo.value.holdFromShape = shapeId;
    } else if (holdInfo.value.movedNode === 'to') {
      holdInfo.value.holdToId = nodeId;
      holdInfo.value.holdToShape = shapeId;
    }
  }

  function unsetConnectionNodeId(nodeId: string) {
    if (holdInfo.value.movedNode === 'from' && holdInfo.value.holdFromId === nodeId) {
      holdInfo.value.holdFromId = undefined;
      holdInfo.value.holdFromShape = undefined;
    } else if (holdInfo.value.movedNode === 'to' && holdInfo.value.holdToId === nodeId) {
      holdInfo.value.holdToId = undefined;
      holdInfo.value.holdToShape = undefined;
    }
  }

  function getHoldedLine() {
    const index = diagram.value.shapes.findIndex((shape) => shape.id === holdInfo.value.holdLineId);
    if (index === -1) {
      return undefined;
    }
    return diagram.value.shapes[index];
  }

  /**
   * Delete shape by id
   * @param id Shape id
   */
  function deleteShape(id: string) {
    const index = diagram.value.shapes.findIndex((shape) => shape.id === id);
    if (index === -1) {
      return;
    }
    diagram.value.shapes.splice(index, 1);
  }

  /**
   * Add id to selected list
   * @param id Shape id what is selected
   */
  function addSelectedId(id: string) {
    const target = selectedIds.value.find((selected) => selected.id === id);
    if (!target) {
      selectedIds.value.push({
        id,
        children: [],
      });
    }
  }

  /**
   * Set id to selected list
   * @param id Shape id what is selected
   */
  function setSelectedId(id: string) {
    const target = selectedIds.value.find((selected) => selected.id === id);
    if (!target) {
      selectedIds.value.push({
        id,
        children: [],
      });
    } else {
      selectedIds.value[0] = target;
      selectedIds.value.length = 1;
    }
  }

  function handleDrag(details: {
    isFirst?: boolean,
    isFinal?: boolean,
    delta?: {
      x?: number,
      y?: number,
    },
  }) {
    if (details.isFirst) {
      dragShift.value.x = 0;
      dragShift.value.y = 0;
      holdInfo.value.type = 'drag';
      return;
    }
    if (details.isFinal) {
      selectedIds.value.forEach((selected) => {
        const targetShape = diagram.value.shapes.find((shape) => shape.id === selected.id);
        if (!targetShape) {
          return;
        }
        if (targetShape.type === 'line') {
          return;
        }
        targetShape.position.x += dragShift.value.x;
        targetShape.position.y += dragShift.value.y;
      });
      holdInfo.value.type = 'none';
      return;
    }
    if (details.delta?.x) {
      dragShift.value.x += details.delta.x;
    }
    if (details.delta?.y) {
      dragShift.value.y += details.delta.y;
    }
  }

  return {
    diagram,
    offsetX,
    offsetY,
    holdInfo,
    selectedIds,
    dragShift,
    holdType,
    pointShift,
    holdFrom,
    holdTo,
    connectionNode,
    selectedSquare,
    setBoudings,
    startConnect,
    startReconnectFrom,
    startHolding,
    movingByEvent,
    endHolding,
    setConnectionNodeId,
    unsetConnectionNodeId,
    getHoldedLine,
    deleteShape,
    addSelectedId,
    setSelectedId,
    handleDrag,
  };
});

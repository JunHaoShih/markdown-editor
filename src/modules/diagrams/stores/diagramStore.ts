import { defineStore } from 'pinia';
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

interface DiagramStore {
  diagram: Diagram,
  offsetX: number,
  offsetY: number,
  holdInfo: MouseHoldInfo,
  selectedIds: SelectStructure[],
  dragShift: Point,
}

interface Rectangle {
  x: number,
  y: number,
  width: number,
  height: number,
}

export const useDiagramStore = defineStore('diagram', {
  state: (): DiagramStore => ({
    diagram: {
      shapes: [],
    },
    offsetX: 0,
    offsetY: 0,
    holdInfo: {
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
    },
    selectedIds: [],
    dragShift: {
      x: 0,
      y: 0,
    },
  }),
  getters: {
    holdType: (state) => state.holdInfo.type,
    pointShift: (state) => (point: Point): Point => {
      const shiftedPoint: Point = {
        x: point.x - state.offsetX,
        y: point.y - state.offsetY,
      };
      return shiftedPoint;
    },
    holdFrom: (state) => state.holdInfo.holdFrom,
    holdTo: (state) => state.holdInfo.holdTo,
    connectionNode: (state) => (nodeId: string): ConnectionNode | undefined => {
      const targetNode = state.diagram.shapes
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
    },
    selectedSquare: (state): Rectangle => {
      const targetShapes = state.diagram.shapes
        .filter((shape) => state.selectedIds.map((selected) => selected.id).includes(shape.id));
      const minX = Math.min(...targetShapes.map((shape) => shape.position.x));
      const minY = Math.min(...targetShapes.map((shape) => shape.position.y));
      const maxX = Math.max(
        ...targetShapes.map((shape) => shape.position.x + (shape.width ?? 0)),
      );
      const maxY = Math.max(
        ...targetShapes.map((shape) => shape.position.y + (shape.height ?? 0)),
      );
      return {
        x: minX + state.dragShift.x,
        y: minY + state.dragShift.y,
        width: maxX - minX,
        height: maxY - minY,
      };
    },
  },
  actions: {
    setBoudings(dom: DOMRect) {
      this.offsetX = dom.left;
      this.offsetY = dom.top;
    },

    /**
     * Start connect new line
     * @param x Starting x coordinate
     * @param y Starting y coordinate
     * @param fromId from which node
     * @param shapeId from which shape
     */
    startConnect(x: number, y: number, fromId: string, shapeId: string) {
      this.holdInfo.holdFrom.x = x;
      this.holdInfo.holdFrom.y = y;
      this.holdInfo.holdFromShape = shapeId;
      this.holdInfo.type = 'connect';
      this.holdInfo.movedNode = 'to';
      this.holdInfo.holdToId = '';
      this.holdInfo.holdLineId = '';
      this.holdInfo.holdToShape = '';
      this.selectedIds.length = 0;
      this.holdInfo.holdFromId = fromId;
    },

    startReconnectFrom(
      movedType: MovedType,
      lineId: string,
      from: Point,
      to: Point,
      fromId?: string,
      toId?: string,
      fromShape?: string,
      toShape?: string,
    ) {
      this.holdInfo.movedNode = movedType;
      this.holdInfo.holdLineId = lineId;

      this.holdInfo.holdFrom.x = from.x;
      this.holdInfo.holdFrom.y = from.y;

      this.holdInfo.holdTo.x = to.x;
      this.holdInfo.holdTo.y = to.y;

      this.holdInfo.holdFromId = fromId;
      this.holdInfo.holdToId = toId;
      this.holdInfo.holdFromShape = fromShape;
      this.holdInfo.holdToShape = toShape;
      this.holdInfo.type = 'reconnect';
      this.selectedIds.length = 0;
    },

    startHolding(type: HoldType, x: number, y: number) {
      this.holdInfo.holdFrom.x = x;
      this.holdInfo.holdFrom.y = y;
      this.holdInfo.type = type;
      this.holdInfo.holdToId = '';
      this.holdInfo.holdLineId = '';
    },

    movingByEvent(evt: MouseEvent) {
      if (this.holdInfo.type === 'reconnect' && this.holdInfo.movedNode === 'from') {
        this.holdInfo.holdFrom.x = evt.x - this.offsetX;
        this.holdInfo.holdFrom.y = evt.y - this.offsetY;
      } else {
        this.holdInfo.holdTo.x = evt.x - this.offsetX;
        this.holdInfo.holdTo.y = evt.y - this.offsetY;
      }
    },

    endHolding() {
      this.holdInfo.type = 'none';
      this.holdInfo.holdFromShape = '';
      this.holdInfo.holdFromId = '';
      this.holdInfo.holdToShape = '';
      this.holdInfo.holdToId = '';
      this.holdInfo.holdLineId = '';
      this.holdInfo.movedNode = 'none';
    },

    setConnectionNodeId(nodeId: string, shapeId: string) {
      if (this.holdInfo.movedNode === 'from') {
        this.holdInfo.holdFromId = nodeId;
        this.holdInfo.holdFromShape = shapeId;
      } else if (this.holdInfo.movedNode === 'to') {
        this.holdInfo.holdToId = nodeId;
        this.holdInfo.holdToShape = shapeId;
      }
    },

    unsetConnectionNodeId(nodeId: string) {
      if (this.holdInfo.movedNode === 'from' && this.holdInfo.holdFromId === nodeId) {
        this.holdInfo.holdFromId = undefined;
        this.holdInfo.holdFromShape = undefined;
      } else if (this.holdInfo.movedNode === 'to' && this.holdInfo.holdToId === nodeId) {
        this.holdInfo.holdToId = undefined;
        this.holdInfo.holdToShape = undefined;
      }
    },

    getHoldedLine() {
      const index = this.diagram.shapes.findIndex((shape) => shape.id === this.holdInfo.holdLineId);
      if (index === -1) {
        return undefined;
      }
      return this.diagram.shapes[index];
    },

    /**
     * Delete shape by id
     * @param id Shape id
     */
    deleteShape(id: string) {
      const index = this.diagram.shapes.findIndex((shape) => shape.id === id);
      if (index === -1) {
        return;
      }
      this.diagram.shapes.splice(index, 1);
    },

    /**
     * Add id to selected list
     * @param id Shape id what is selected
     */
    addSelectedId(id: string) {
      const target = this.selectedIds.find((selected) => selected.id === id);
      if (!target) {
        this.selectedIds.push({
          id,
          children: [],
        });
      }
    },

    /**
     * Set id to selected list
     * @param id Shape id what is selected
     */
    setSelectedId(id: string) {
      const target = this.selectedIds.find((selected) => selected.id === id);
      if (!target) {
        this.selectedIds.push({
          id,
          children: [],
        });
      } else {
        this.selectedIds[0] = target;
        this.selectedIds.length = 1;
      }
    },

    handleDrag(details: {
      isFirst?: boolean,
      isFinal?: boolean,
      delta?: {
        x?: number,
        y?: number,
      },
    }) {
      if (details.isFirst) {
        this.dragShift.x = 0;
        this.dragShift.y = 0;
        this.holdInfo.type = 'drag';
        return;
      }
      if (details.isFinal) {
        this.selectedIds.forEach((selected) => {
          const targetShape = this.diagram.shapes.find((shape) => shape.id === selected.id);
          if (!targetShape) {
            return;
          }
          if (targetShape.type === 'line') {
            return;
          }
          targetShape.position.x += this.dragShift.x;
          targetShape.position.y += this.dragShift.y;
        });
        this.holdInfo.type = 'none';
        return;
      }
      if (details.delta?.x) {
        this.dragShift.x += details.delta.x;
      }
      if (details.delta?.y) {
        this.dragShift.y += details.delta.y;
      }
    },
  },
});

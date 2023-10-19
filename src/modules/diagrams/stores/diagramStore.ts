import { defineStore } from 'pinia';
import { ConnectionNode, Diagram, Point } from '../models/shape';

type HoldType = 'none' | 'connect' | 'multiSelect' | 'drag';

interface MouseHoldInfo {
  type: HoldType,
  isHold: boolean,
  holdFrom: Point,
  holdTo: Point,
  holdFromId?: string,
  holdToId?: string,
}

interface DiagramStore {
  diagram: Diagram,
  offsetX: number,
  offsetY: number,
  holdInfo: MouseHoldInfo,
  selectedIds: string[],
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
        .filter((shape) => state.selectedIds.includes(shape.id));
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
    startHolding(type: HoldType, x: number, y: number, fromId?: string) {
      this.holdInfo.holdFrom.x = x;
      this.holdInfo.holdFrom.y = y;
      this.holdInfo.type = type;
      this.holdInfo.holdToId = '';
      if (fromId) {
        this.setFromNode(fromId);
      }
    },
    moving(x: number, y: number) {
      this.holdInfo.holdTo.x = x;
      this.holdInfo.holdTo.y = y;
    },
    movingByEvent(evt: MouseEvent) {
      this.holdInfo.holdTo.x = evt.x - this.offsetX;
      this.holdInfo.holdTo.y = evt.y - this.offsetY;
    },
    endHolding() {
      this.holdInfo.type = 'none';
    },
    setFromNode(nodeId: string) {
      this.holdInfo.holdFromId = nodeId;
    },
    setToNode(nodeId: string) {
      this.holdInfo.holdToId = nodeId;
    },
    unsetToNode(nodeId: string) {
      if (this.holdInfo.holdToId === nodeId) {
        this.holdInfo.holdToId = undefined;
      }
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
      const target = this.selectedIds.find((selectedId) => selectedId === id);
      if (!target) {
        this.selectedIds.push(id);
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
        this.selectedIds.forEach((id) => {
          const targetShape = this.diagram.shapes.find((shape) => shape.id === id);
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

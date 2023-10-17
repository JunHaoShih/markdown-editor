import { defineStore } from 'pinia';
import { ConnectionNode, Diagram, Point } from '../models/shape';

type HoldType = 'none' | 'connect' | 'multiSelect';

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
}

export const useDiagramStore = defineStore('diagram', {
  state: (): DiagramStore => ({
    diagram: {
      shapes: [],
      lines: [],
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
    connectionNode: (state) => (nodeId: string): Point => {
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
      return targetNode?.point ?? { x: 0, y: 0 };
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
      delta?: {
        x?: number,
        y?: number,
      },
    }) {
      this.selectedIds.forEach((id) => {
        const targetShape = this.diagram.shapes.find((shape) => shape.id === id);
        if (!targetShape) {
          return;
        }
        if (details.delta?.x) {
          targetShape.position.x += details.delta.x;
        }
        if (details.delta?.y) {
          targetShape.position.y += details.delta.y;
        }
      });
    },
  },
});

import { defineStore } from 'pinia';
import { Point } from '../models/shape';

interface DiagramStore {
  offsetX: number,
  offsetY: number,
}

export const useDiagramStore = defineStore('diagram', {
  state: (): DiagramStore => ({
    offsetX: 0,
    offsetY: 0,
  }),
  getters: {
    pointShift: (state) => (point: Point): Point => {
      const shiftedPoint: Point = {
        x: point.x - state.offsetX,
        y: point.y - state.offsetY,
      };
      return shiftedPoint;
    },
  },
  actions: {
    setBoudings(dom: DOMRect) {
      this.offsetX = dom.left;
      this.offsetY = dom.top;
    },
  },
});

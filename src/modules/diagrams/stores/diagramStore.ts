import { defineStore } from 'pinia';
import { DiagramController } from '../services/diagramService';

interface DiagramStore {
  diagram: DiagramController,
}

export const useDiagramStore = defineStore('diagram', {
  state: (): DiagramStore => ({
    diagram: {} as DiagramController,
  }),
});

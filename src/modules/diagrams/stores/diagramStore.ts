import { defineStore } from 'pinia';

const useDiagramStore = defineStore('diagram', {
  state: () => ({
    touchState: '',
  }),
});

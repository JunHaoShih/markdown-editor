import { ArrowType } from '../../models/shape';

interface Path {
  fill?: string,
  stroke?: string,
  strokeWidth?: number,
  d: string,
}

interface Marker {
  id: ArrowType,
  name: string,
  viewBox: string,
  refX: number,
  refY: number,
  markerWidth: number,
  markerHeight: number,
  orient: string,
  path: Path,
}

export const markers: Marker[] = [
  {
    id: 'arrow',
    name: 'diagram.arrows.arrow',
    viewBox: '0 0 10 10',
    refX: 10,
    refY: 5,
    markerWidth: 9,
    markerHeight: 9,
    orient: 'auto-start-reverse',
    path: {
      d: 'M 0 0 L 10 5 L 0 10 z',
    },
  },
  {
    id: 'zero2Many',
    name: 'diagram.arrows.zero2Many',
    viewBox: '0 0 100 56',
    refX: 100,
    refY: 30,
    markerWidth: 15,
    markerHeight: 15,
    orient: 'auto-start-reverse',
    path: {
      fill: 'transparent',
      stroke: 'black',
      strokeWidth: 8,
      d: 'M30 2a28 28 0 101 0zM100 3 59 30 100 56',
    },
  },
  {
    id: 'one2Many',
    name: 'diagram.arrows.one2Many',
    viewBox: '0 0 100 56',
    refX: 100,
    refY: 30,
    markerWidth: 15,
    markerHeight: 15,
    orient: 'auto-start-reverse',
    path: {
      fill: 'transparent',
      stroke: 'black',
      strokeWidth: 8,
      d: 'M30 2 v 54 M100 3 59 30 100 56',
    },
  },
  {
    id: 'exactOne',
    name: 'diagram.arrows.exactOne',
    viewBox: '0 0 100 56',
    refX: 100,
    refY: 30,
    markerWidth: 15,
    markerHeight: 15,
    orient: 'auto-start-reverse',
    path: {
      fill: 'transparent',
      stroke: 'black',
      strokeWidth: 8,
      d: 'M30 2 v 54',
    },
  },
  {
    id: 'zero2One',
    name: 'diagram.arrows.zero2One',
    viewBox: '0 0 100 56',
    refX: 100,
    refY: 30,
    markerWidth: 15,
    markerHeight: 15,
    orient: 'auto-start-reverse',
    path: {
      fill: 'transparent',
      stroke: 'black',
      strokeWidth: 8,
      d: 'M30 2a28 28 0 101 0zM80 3v54',
    },
  },
];

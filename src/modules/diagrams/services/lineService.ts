import { v4 as uuidv4 } from 'uuid';
import { Point, Shape } from '../models/shape';

export function createLine(info: {
  fromAbsolute: Point,
  toAbsolute: Point,
  fromNode?: string | null,
  toNode?: string | null,
}): Shape {
  return {
    id: uuidv4(),
    type: 'line',
    title: '123',
    position: info.fromAbsolute,
    connectionNodes: [],
    extraSizeInfos: {},
    toAbsolute: info.toAbsolute,
    fromNode: info.fromNode,
    toNode: info.toNode,
    arrowStart: 'one2Many',
    arrowEnd: 'arrow',
  };
}

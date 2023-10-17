import { v4 as uuidv4 } from 'uuid';
import { Shape } from '../models/shape';
import { IconInfo } from '../models/iconInfo';

export const rectConf = {
  defaultWidth: 150,
  defaultHeight: 90,
  minWidth: 30,
  minHeight: 30,
};

export function createRectangle(x: number, y: number): Shape {
  return {
    id: uuidv4(),
    type: 'rectangle',
    title: '123',
    position: { x, y },
    width: rectConf.defaultWidth,
    height: rectConf.defaultHeight,
    minWidth: rectConf.minWidth,
    minHeight: rectConf.minHeight,
    connectionNodes: [
      {
        id: uuidv4(),
        orient: 'left',
        point: { x: 0, y: 0 },
      },
      {
        id: uuidv4(),
        orient: 'right',
        point: { x: 0, y: 0 },
      },
      {
        id: uuidv4(),
        orient: 'top',
        point: { x: 0, y: 0 },
      },
      {
        id: uuidv4(),
        orient: 'bottom',
        point: { x: 0, y: 0 },
      },
    ],
    extraSizeInfos: {},
  };
}

/**
 * Database icon information
 */
export const ractangleIcon: IconInfo = {
  type: 'rectangle',
  name: 'diagram.rectangle',
  viewBox: '0 -960 960 960',
  path: 'M80-160v-640h800v640H80Zm80-80h640v-480H160v480Zm0 0v-480 480Z',
  svgType: 'rect',
  attributes: [
    { key: 'fill', value: 'transparent' },
    { key: 'stroke-dasharray', value: '5,5' },
    { key: 'stroke', value: 'black' },
    { key: 'height', value: `${rectConf.defaultHeight}` },
    { key: 'width', value: `${rectConf.defaultWidth}` },
  ],
};

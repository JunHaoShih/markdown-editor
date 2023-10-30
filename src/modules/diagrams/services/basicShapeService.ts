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
    title: 'rectangle',
    position: { x, y },
    width: rectConf.defaultWidth,
    height: rectConf.defaultHeight,
    minWidth: rectConf.minWidth,
    minHeight: rectConf.minHeight,
    connectionNodes: [
      {
        id: uuidv4(),
        orient: 270,
        point: { x: 0, y: 0 },
      },
      {
        id: uuidv4(),
        orient: 90,
        point: { x: 0, y: 0 },
      },
      {
        id: uuidv4(),
        orient: 0,
        point: { x: 0, y: 0 },
      },
      {
        id: uuidv4(),
        orient: 180,
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

export const ellipseConf = {
  defaultWidth: 150,
  defaultHeight: 90,
  minWidth: 30,
  minHeight: 30,
};

export function createEllipse(x: number, y: number): Shape {
  return {
    id: uuidv4(),
    type: 'ellipse',
    title: 'ellipse',
    position: { x, y },
    width: ellipseConf.defaultWidth,
    height: ellipseConf.defaultHeight,
    minWidth: ellipseConf.minWidth,
    minHeight: ellipseConf.minHeight,
    connectionNodes: [
      {
        id: uuidv4(),
        orient: 270,
        point: { x: 0, y: 0 },
      },
      {
        id: uuidv4(),
        orient: 90,
        point: { x: 0, y: 0 },
      },
      {
        id: uuidv4(),
        orient: 0,
        point: { x: 0, y: 0 },
      },
      {
        id: uuidv4(),
        orient: 180,
        point: { x: 0, y: 0 },
      },
    ],
    extraSizeInfos: {},
  };
}

/**
 * Ellipse icon information
 */
export const ellipseIcon: IconInfo = {
  type: 'ellipse',
  name: 'diagram.ellipse',
  viewBox: '0 -960 960 960',
  path: 'M480-750a500 300 0 101 0zM480-210a440 240 0 111 0z',
  svgType: 'ellipse',
  attributes: [
    { key: 'fill', value: 'transparent' },
    { key: 'stroke-dasharray', value: '5,5' },
    { key: 'stroke', value: 'black' },
    { key: 'cx', value: `${rectConf.defaultWidth / 2}` },
    { key: 'cy', value: `${rectConf.defaultHeight / 2}` },
    { key: 'rx', value: `${rectConf.defaultWidth / 2}` },
    { key: 'ry', value: `${rectConf.defaultHeight / 2}` },
  ],
};

export const circleConf = {
  defaultWidth: 90,
  defaultHeight: 90,
  minWidth: 30,
  minHeight: 30,
};

export function createCircle(x: number, y: number): Shape {
  return {
    id: uuidv4(),
    type: 'circle',
    title: 'circle',
    position: { x, y },
    width: circleConf.defaultWidth,
    height: circleConf.defaultHeight,
    minWidth: circleConf.minWidth,
    minHeight: circleConf.minHeight,
    connectionNodes: [
      {
        id: uuidv4(),
        orient: 270,
        point: { x: 0, y: 0 },
      },
      {
        id: uuidv4(),
        orient: 90,
        point: { x: 0, y: 0 },
      },
      {
        id: uuidv4(),
        orient: 0,
        point: { x: 0, y: 0 },
      },
      {
        id: uuidv4(),
        orient: 180,
        point: { x: 0, y: 0 },
      },
    ],
    extraSizeInfos: {},
  };
}

/**
 * Circle icon information
 */
export const circleIcon: IconInfo = {
  type: 'circle',
  name: 'diagram.circle',
  viewBox: '0 -960 960 960',
  path: 'M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z',
  svgType: 'circle',
  attributes: [
    { key: 'fill', value: 'transparent' },
    { key: 'stroke-dasharray', value: '5,5' },
    { key: 'stroke', value: 'black' },
    { key: 'cx', value: `${circleConf.defaultWidth / 2}` },
    { key: 'cy', value: `${circleConf.defaultHeight / 2}` },
    { key: 'r', value: `${circleConf.defaultWidth / 2}` },
  ],
};

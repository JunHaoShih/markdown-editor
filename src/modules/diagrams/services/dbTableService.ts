import { v4 as uuidv4 } from 'uuid';
import { Shape } from '../models/shape';
import { DbTableColumn } from '../models/dbTableColumn';
import { IconInfo } from '../models/iconInfo';

export const dbTableConf = {
  minIconWidth: 30,
  minNameWidth: 90,
  minTypeWidth: 50,
  minLabelWidth: 30,
};

function fullWidth() {
  return dbTableConf.minIconWidth
    + dbTableConf.minNameWidth
    + dbTableConf.minTypeWidth
    + dbTableConf.minLabelWidth;
}

export function createDbTable(x: number, y: number): Shape {
  return {
    id: uuidv4(),
    type: 'dbTable',
    position: { x, y },
    title: 'Table name',
    dbColumns: [],
    connectionNodes: [],
    extraSizeInfos: {
      icon: { width: 30, minWidth: dbTableConf.minIconWidth },
      name: { width: 90, minWidth: dbTableConf.minNameWidth },
      type: { width: 50, minWidth: dbTableConf.minTypeWidth },
      label: { width: 30, minWidth: dbTableConf.minLabelWidth },
    },
    height: 30,
    width: fullWidth(),
  };
}

export function createDbTableColumn(): DbTableColumn {
  return {
    id: uuidv4(),
    name: 'column',
    isPrimary: false,
    type: 'int',
    uniqueKeys: '',
    height: 30,
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
    ],
  };
}

/**
 * Find target node inside DbTableColumns
 * @param dbColumns Target DbTableColumns
 * @param nodeId The node id you want to find
 * @returns Search result
 */
export function findConnectionNode(dbColumns: DbTableColumn[], nodeId: string) {
  return dbColumns
    .flatMap((col) => col.connectionNodes)
    .find((node) => node.id === nodeId);
}

/**
 * Database icon information
 */
export const dbTableIcon: IconInfo = {
  type: 'dbTable',
  name: 'diagram.dbTable',
  viewBox: '0 -960 960 960',
  path: 'M760-360v-80H200v80h560Zm0-160v-80H200v80h560Zm0-160v-80H200v80h560ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm560-80v-80H200v80h560Z',
  svgType: 'rect',
  attributes: [
    { key: 'fill', value: 'transparent' },
    { key: 'stroke-dasharray', value: '5,5' },
    { key: 'stroke', value: 'black' },
    { key: 'height', value: '30' },
    { key: 'width', value: `${fullWidth()}` },
  ],
};

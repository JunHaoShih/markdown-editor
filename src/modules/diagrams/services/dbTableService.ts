import { v4 as uuidv4 } from 'uuid';
import { Shape } from '../models/shape';
import { DbTableColumn } from '../models/dbTableColumn';

export const dbTableConf = {
  minIconWidth: 30,
  minNameWidth: 90,
  minTypeWidth: 50,
  minLabelWidth: 30,
};

export function createDbTable(x: number, y: number): Shape {
  return {
    id: uuidv4(),
    type: 'dbTable',
    x,
    y,
    title: 'Table name',
    dbColumns: [],
    extraSizeInfos: {
      icon: { width: 30, minWidth: dbTableConf.minIconWidth },
      name: { width: 90, minWidth: dbTableConf.minNameWidth },
      type: { width: 50, minWidth: dbTableConf.minTypeWidth },
      label: { width: 30, minWidth: dbTableConf.minLabelWidth },
    },
    height: 30,
    width: 200,
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

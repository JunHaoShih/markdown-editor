import { v4 as uuidv4 } from 'uuid';

export interface DbTableColumn {
  /**
   * Guid of this data
   */
  id: string,
  /**
   * Table column name
   */
  name: string,
  /**
   * Is column primary key
   */
  isPrimary: boolean,
  /**
   * Column data typr
   */
  type: string,
  /**
   * Unique constraints
   */
  uniqueKeys: string[],
  /**
   * Row height(Because db column is displayed as row, so it's row height)
   */
  height: number,
}

export interface DbTable {
  /**
   * Database table name
   */
  title: string,
  /**
   * Table columns
   */
  columns: DbTableColumn[],
  /**
   * Width of icon grid
   */
  iconWidth: number,
  /**
   * Minimum width of icon grid
   */
  minIconWidth: number,
  /**
   * Width of table name grid
   */
  nameWidth: number,
  /**
   * Minimum width of name grid
   */
  minNameWidth: number,
  /**
   * Width of type grid
   */
  typeWidth: number,
  /**
   * Minimum width of type grid
   */
  minTypeWidth: number,
  /**
   * Width of constraint grid
   */
  labelWidth: number,
  /**
   * Minimum width of label grid
   */
  minLabelWidth: number,
}

export function createDbTable(): DbTable {
  return {
    title: 'TableName',
    columns: [],
    iconWidth: 30,
    minIconWidth: 30,
    nameWidth: 90,
    minNameWidth: 90,
    typeWidth: 50,
    minTypeWidth: 50,
    labelWidth: 30,
    minLabelWidth: 30,
  };
}

export function createDbTableColumn(): DbTableColumn {
  return {
    id: uuidv4(),
    name: 'column',
    isPrimary: true,
    type: 'int',
    uniqueKeys: [],
    height: 30,
  };
}

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
  /**
   * Is editing
   */
  isEditing?: boolean,
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
   * Width of table name grid
   */
  nameWidth: number,
  /**
   * Width of type grid
   */
  typeWidth: number,
  /**
   * Width of constraint grid
   */
  labelWidth: number,
}

export function createDbTable(): DbTable {
  return {
    title: 'TableName',
    columns: [],
    iconWidth: 30,
    nameWidth: 90,
    typeWidth: 50,
    labelWidth: 30,
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

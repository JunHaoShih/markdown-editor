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
   * Column data type
   */
  type: string,
  /**
   * Unique constraints
   */
  uniqueKeys: string,
  /**
   * Row height(Because db column is displayed as row, so it's row height)
   */
  height: number,
  /**
   * Id of left connection node
   */
  leftPointId: string,
  /**
   * Id of right connection node
   */
  rightPointId: string,
}

export function createDbTableColumn(): DbTableColumn {
  return {
    id: uuidv4(),
    name: 'column',
    isPrimary: false,
    type: 'int',
    uniqueKeys: '',
    height: 30,
    leftPointId: uuidv4(),
    rightPointId: uuidv4(),
  };
}

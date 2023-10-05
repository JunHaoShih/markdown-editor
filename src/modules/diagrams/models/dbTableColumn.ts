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

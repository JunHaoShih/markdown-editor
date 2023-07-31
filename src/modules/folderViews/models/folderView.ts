export type FolderItemType = 'article';

export interface FolderItem {
  id: string,
  name: string,
  type: FolderItemType,
  children: FolderItem[],
}

export interface FolderView {
  name: string,
  content: FolderItem[],
  userId: string,
}

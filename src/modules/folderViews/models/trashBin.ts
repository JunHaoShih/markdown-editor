import { FolderItem } from './folderView';

export interface TrashBin {
  name: string,
  content: FolderItem[],
  userId: string,
}

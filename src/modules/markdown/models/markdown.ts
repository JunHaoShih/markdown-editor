import { Timestamp } from 'firebase/firestore';

export interface Markdown {
  content: string,
  userId: string,
  isDeleted: boolean,
  createAt: Timestamp,
  updateAt: Timestamp,
  deleteAt?: Timestamp,
}

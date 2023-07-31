import { db } from 'src/boot/firebase';
import {
  QueryDocumentSnapshot, doc, getDoc, setDoc,
} from 'firebase/firestore';
import { FolderView } from '../models/folderView';

const collectionName = 'folderViews';

const markdownFolderView = 'Markdown';

const converter = {
  toFirestore: (view: FolderView): FolderView => view,
  fromFirestore: (snap: QueryDocumentSnapshot) => (
    snap.data() as FolderView
  ),
};

export async function setFolderView(folderView: FolderView) {
  await setDoc(doc(db, collectionName, folderView.userId), folderView);
}

export async function setDefaultFolderView(userId: string) {
  const result = await setFolderView({
    name: markdownFolderView,
    content: [],
    userId,
  });
  return result;
}

export async function getMarkdownFolderView(userId: string): Promise<FolderView | undefined> {
  const ref = doc(db, collectionName, userId).withConverter(converter);
  const folderViews = await getDoc(ref)
    .then((value) => value)
    .catch((error) => null);
  return folderViews?.data();
}

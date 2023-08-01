import {
  QueryDocumentSnapshot, doc, getDoc, setDoc,
} from 'firebase/firestore';
import { db } from 'src/boot/firebase';
import { Markdown } from '../models/markdown';

const collectionName = 'markdowns';

const converter = {
  toFirestore: (view: Markdown): Markdown => view,
  fromFirestore: (snap: QueryDocumentSnapshot) => (
    snap.data() as Markdown
  ),
};

export async function setMarkdown(markdown: Markdown, id: string) {
  await setDoc(doc(db, collectionName, id), markdown);
}

export async function getMarkdown(id: string): Promise<Markdown | undefined> {
  const ref = doc(db, collectionName, id).withConverter(converter);
  const folderViews = await getDoc(ref)
    .then((response) => response)
    .catch(() => null);
  return folderViews?.data();
}

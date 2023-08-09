import {
  QueryDocumentSnapshot,
  QuerySnapshot,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
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

export async function getMarkdown(id: string): Promise<Markdown | undefined> {
  const ref = doc(db, collectionName, id).withConverter(converter);
  const folderViews = await getDoc(ref)
    .then((response) => response)
    .catch(() => null);
  return folderViews?.data();
}

export async function updateDelete(isDeleted: boolean, id: string) {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    isDeleted,
    deleteAt: serverTimestamp(),
  });
}

export async function setMarkdown(markdown: Markdown, id: string) {
  const docRef = doc(db, collectionName, id);
  const isExist = !!await getMarkdown(id);
  await setDoc(docRef, markdown);
  if (!isExist) {
    await updateDoc(docRef, {
      createAt: serverTimestamp(),
      updateAt: serverTimestamp(),
    });
  } else {
    await updateDoc(docRef, {
      updateAt: serverTimestamp(),
    });
  }
}

export async function getDeletedMarkdowns(userId: string)
: Promise<QuerySnapshot<Markdown, Markdown>> {
  const q = query(
    collection(db, collectionName),
    where('userId', '==', userId),
    where('isDeleted', '==', true),
  ).withConverter(converter);

  const querySnapshot = await getDocs(q);
  return querySnapshot;
}

export async function deleteMarkdown(id: string) {
  await deleteDoc(doc(db, collectionName, id));
}

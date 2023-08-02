import { db } from 'src/boot/firebase';
import {
  QueryDocumentSnapshot, doc, getDoc, setDoc,
} from 'firebase/firestore';
import { TrashBin } from '../models/trashBin';

const collectionName = 'trashBins';

const trashBinView = 'TrashBin';

const converter = {
  toFirestore: (view: TrashBin): TrashBin => view,
  fromFirestore: (snap: QueryDocumentSnapshot) => (
    snap.data() as TrashBin
  ),
};

export async function setTrashBin(trashBin: TrashBin) {
  await setDoc(doc(db, collectionName, trashBin.userId), trashBin);
}

export async function setDefaultTrashBin(userId: string) {
  const result = await setTrashBin({
    name: trashBinView,
    content: [],
    userId,
  });
  return result;
}

export async function getTrashBin(userId: string): Promise<TrashBin | undefined> {
  const ref = doc(db, collectionName, userId).withConverter(converter);
  const folderViews = await getDoc(ref)
    .then((value) => value)
    .catch(() => null);
  return folderViews?.data();
}

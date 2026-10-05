import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from './config';

/**
 * Uploads compressed WebP progress photo to private user path
 * Path: users/{uid}/progress/{checkpointId}/{photoType}.webp
 */
export async function uploadProgressPhoto(
  uid: string,
  checkpointId: 'day001' | 'day030' | 'day060' | 'day090' | 'day124',
  photoType: 'front' | 'side' | 'back',
  blob: Blob
): Promise<string> {
  const path = `users/${uid}/progress/${checkpointId}/${photoType}.webp`;
  const fileRef = storageRef(storage, path);
  await uploadBytes(fileRef, blob, {
    contentType: 'image/webp',
    cacheControl: 'private, max-age=86400'
  });
  return getDownloadURL(fileRef);
}

/**
 * Deletes all stored progress photos for the user during account deletion
 */
export async function deleteAllUserPhotos(uid: string): Promise<void> {
  const rootRef = storageRef(storage, `users/${uid}/progress`);
  try {
    const listResult = await listAll(rootRef);
    for (const folderRef of listResult.prefixes) {
      const items = await listAll(folderRef);
      for (const itemRef of items.items) {
        await deleteObject(itemRef).catch(() => {});
      }
    }
  } catch {
    // Ignore error if folder does not exist
  }
}

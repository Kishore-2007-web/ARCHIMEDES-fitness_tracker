import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from './config';

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Uploads compressed WebP progress photo to private user path.
 * If offline, in operator mode, or if network upload fails,
 * safely stores as Data URL locally so progression is 100% offline-ready.
 */
export async function uploadProgressPhoto(
  uid: string,
  checkpointId: 'day001' | 'day030' | 'day060' | 'day090' | 'day120' | 'day124',
  photoType: 'front' | 'side' | 'back',
  blob: Blob
): Promise<string> {
  // If offline or operator mode, persist locally immediately
  if (uid.startsWith('operator') || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    const dataUrl = await blobToDataUrl(blob);
    try {
      localStorage.setItem(`archimedes_photo_${uid}_${checkpointId}_${photoType}`, dataUrl);
    } catch {}
    return dataUrl;
  }

  try {
    const path = `users/${uid}/progress/${checkpointId}/${photoType}.webp`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, blob, {
      contentType: 'image/webp',
      cacheControl: 'private, max-age=86400'
    });
    return await getDownloadURL(fileRef);
  } catch (err) {
    console.warn('Network photo upload unavailable. Fallback to local Data URL:', err);
    const dataUrl = await blobToDataUrl(blob);
    try {
      localStorage.setItem(`archimedes_photo_${uid}_${checkpointId}_${photoType}`, dataUrl);
    } catch {}
    return dataUrl;
  }
}

/**
 * Deletes all stored progress photos for the user during account deletion
 */
export async function deleteAllUserPhotos(uid: string): Promise<void> {
  // Clear local photo storage keys
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`archimedes_photo_${uid}_`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}

  if (uid.startsWith('operator')) return;

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

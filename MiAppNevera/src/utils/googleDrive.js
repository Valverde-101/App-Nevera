import * as FileSystem from 'expo-file-system';
import { exportBackup, importBackup } from './backup';

const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id';
const DRIVE_LIST_URL = 'https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name,modifiedTime)&orderBy=modifiedTime%20desc&spaces=appDataFolder';

export const uploadBackupToDrive = async token => {
  const fileUri = await exportBackup(false);
  if (!fileUri) return;
  const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
  const boundary = 'foo_bar_baz';
  const metadata = { name: 'nevera_backup.zip', parents: ['appDataFolder'] };
  const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/zip\r\nContent-Transfer-Encoding: base64\r\n\r\n${base64}\r\n--${boundary}--`;
  await fetch(DRIVE_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  }).catch(e => console.error('Drive upload failed', e));
};

export const downloadBackupFromDrive = async token => {
  try {
    const list = await fetch(DRIVE_LIST_URL, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    const file = list.files && list.files[0];
    if (!file) return false;
    const dest = FileSystem.documentDirectory + 'drive_backup.zip';
    await FileSystem.downloadAsync(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, dest, { headers: { Authorization: `Bearer ${token}` } });
    await importBackup(dest);
    return true;
  } catch (e) {
    console.error('Drive download failed', e);
    return false;
  }
};

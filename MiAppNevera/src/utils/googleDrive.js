import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { createBackupFile, importBackupFromZipData } from './backup';

const BASE_BACKUP_NAME = 'RefriMudanza';
const MAX_REVISIONS = 10;

export const uploadBackupToGoogleDrive = async (accessToken) => {
  const file = await createBackupFile();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `${BASE_BACKUP_NAME}_${timestamp}.zip`;

  const listParams = new URLSearchParams({
    q: `name contains '${BASE_BACKUP_NAME}_' and trashed=false`,
    spaces: 'appDataFolder',
    fields: 'files(id,name)',
    orderBy: 'modifiedTime desc',
    pageSize: '1',
  });
  const listRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?${listParams.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!listRes.ok) {
    const text = await listRes.text();
    throw new Error(text || 'Search files failed');
  }
  const listData = await listRes.json();
  const existing = listData.files?.[0];

  const metadata = {
    name: backupName,
    mimeType: 'application/zip',
  };
  if (!existing) {
    metadata.parents = ['appDataFolder'];
  }
  const form = new FormData();
  const metadataValue = Platform.OS === 'web'
    ? new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    : JSON.stringify(metadata);
  form.append('metadata', metadataValue);
  if (Platform.OS === 'web') {
    form.append('file', file.blob, backupName);
  } else {
    form.append('file', {
      uri: file.uri,
      name: backupName,
      type: 'application/zip',
    });
  }

  const url = existing
    ? `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart&fields=id`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id';
  const method = existing ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Upload failed');
  }
  const data = await res.json();

  if (existing) {
    try {
      const revRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${existing.id}/revisions?fields=revisions(id,modifiedTime)&pageSize=100`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (revRes.ok) {
        const revData = await revRes.json();
        const revisions = (revData.revisions || []).sort(
          (a, b) => new Date(a.modifiedTime) - new Date(b.modifiedTime)
        );
        const excess = revisions.length - MAX_REVISIONS;
        for (let i = 0; i < excess; i++) {
          const rev = revisions[i];
          await fetch(
            `https://www.googleapis.com/drive/v3/files/${existing.id}/revisions/${rev.id}`,
            { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
          );
        }
      }
    } catch (e) {
      console.error('Failed to prune revisions', e);
    }
  }

  return data;
};

export const downloadBackupFromGoogleDrive = async (accessToken) => {
  const listParams = new URLSearchParams({
    q: `name contains '${BASE_BACKUP_NAME}_' and trashed=false`,
    spaces: 'appDataFolder',
    fields: 'files(id,name,mimeType,modifiedTime)',
    orderBy: 'modifiedTime desc',
    pageSize: '1',
  });
  const listRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?${listParams.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!listRes.ok) {
    const text = await listRes.text();
    throw new Error(text || 'List files failed');
  }
  const listData = await listRes.json();
  const file = listData.files?.[0];
  if (!file?.id) {
    throw new Error('No se encontró el respaldo.');
  }
  if (file.mimeType !== 'application/zip') {
    throw new Error('Tipo de archivo inválido');
  }

  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
  let arrayBuffer;
  if (Platform.OS === 'web') {
    const fileRes = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!fileRes.ok) {
      const text = await fileRes.text();
      throw new Error(text || 'Download failed');
    }
    arrayBuffer = await fileRes.arrayBuffer();
  } else {
    const tempUri = FileSystem.cacheDirectory + 'backup.zip';
    const res = await FileSystem.downloadAsync(downloadUrl, tempUri, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const base64 = await FileSystem.readAsStringAsync(res.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const binary = global.atob(base64);
    const array = Uint8Array.from(binary, c => c.charCodeAt(0));
    arrayBuffer = array.buffer;
    await FileSystem.deleteAsync(res.uri).catch(() => {});
  }
  const zipData = new Uint8Array(arrayBuffer);
  await importBackupFromZipData(zipData);
};


import { Platform } from 'react-native';
import { createBackupFile, importBackupFromZipData } from './backup';

const BASE_BACKUP_NAME = 'RefriMudanza';
const MAX_REVISIONS = 10;

export const uploadBackupToGoogleDrive = async (accessToken) => {
  const file = await createBackupFile();
  if (Platform.OS !== 'web') {
    throw new Error('Solo disponible en la versión web.');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = file.name.replace('.zip', `_${timestamp}.zip`);

  const listRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name%20contains%20'${BASE_BACKUP_NAME}_'%20and%20trashed=false&spaces=appDataFolder&fields=files(id,name)&orderBy=modifiedTime%20desc&pageSize=1`,
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
    parents: ['appDataFolder'],
  };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file.blob, backupName);

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
  if (Platform.OS !== 'web') {
    throw new Error('Solo disponible en la versión web.');
  }

  const listRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name%20contains%20'${BASE_BACKUP_NAME}_'%20and%20trashed=false&spaces=appDataFolder&fields=files(id,name,mimeType,modifiedTime)&orderBy=modifiedTime%20desc&pageSize=1`,
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

  const fileRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!fileRes.ok) {
    const text = await fileRes.text();
    throw new Error(text || 'Download failed');
  }
  const arrayBuffer = await fileRes.arrayBuffer();
  const zipData = new Uint8Array(arrayBuffer);
  await importBackupFromZipData(zipData);
};


import { Platform } from 'react-native';
import { createBackupFile, importBackupFromZipData } from './backup';

export const uploadBackupToGoogleDrive = async (accessToken) => {
  const file = await createBackupFile();
  if (Platform.OS !== 'web') {
    throw new Error('Solo disponible en la versión web.');
  }

  // Elimina respaldos anteriores con el mismo nombre para evitar duplicados.
  const listRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${file.name}'%20and%20trashed=false&fields=files(id)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!listRes.ok) {
    const text = await listRes.text();
    throw new Error(text || 'Search files failed');
  }
  const listData = await listRes.json();
  for (const existing of listData.files || []) {
    const delRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${existing.id}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!delRes.ok) {
      const text = await delRes.text();
      throw new Error(text || 'Delete old backup failed');
    }
  }

  // Construimos el cuerpo con FormData para que el navegador gestione
  // correctamente los límites y cabeceras del multipart.
  const metadata = { name: file.name, mimeType: 'application/zip' };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file.blob, file.name);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Upload failed');
  }
  return res.json();
};

export const downloadBackupFromGoogleDrive = async (accessToken) => {
  if (Platform.OS !== 'web') {
    throw new Error('Solo disponible en la versión web.');
  }

  const listRes = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=name='RefriMudanza.zip'&fields=files(id,name,modifiedTime)&orderBy=modifiedTime%20desc&pageSize=1",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!listRes.ok) {
    const text = await listRes.text();
    throw new Error(text || 'List files failed');
  }
  const listData = await listRes.json();
  const fileId = listData.files?.[0]?.id;
  if (!fileId) {
    throw new Error('No se encontró el respaldo.');
  }

  const fileRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
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

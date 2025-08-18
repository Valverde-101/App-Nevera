import { Platform } from 'react-native';
import SparkMD5 from 'spark-md5';
import { createBackupFile, importBackupFromZipData } from './backup';

const MAX_REVISIONS = 5;

export const uploadBackupToGoogleDrive = async (accessToken) => {
  const file = await createBackupFile();
  if (Platform.OS !== 'web') {
    throw new Error('Solo disponible en la versión web.');
  }

  // Nombre con timestamp para evitar duplicados entre subidas
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `RefriMudanza-${timestamp}.zip`;
  const arrayBuffer = await file.blob.arrayBuffer();
  const localMd5Hex = SparkMD5.ArrayBuffer.hash(arrayBuffer);
  const localMd5Base64 = btoa(
    SparkMD5.ArrayBuffer.hash(arrayBuffer, true)
  );

  // Busca un respaldo existente para crear una nueva revisión en lugar de un duplicado
  const listRes = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=name%20contains%20'RefriMudanza'" +
      "%20and%20trashed=false&spaces=appDataFolder&fields=files(id,name)",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!listRes.ok) {
    const text = await listRes.text();
    throw new Error(text || 'Search files failed');
  }
  const listData = await listRes.json();
  const existing = listData.files?.[0];

  const metadata = {
    name: fileName,
    mimeType: 'application/zip',
    parents: ['appDataFolder'],
  };
  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', file.blob, fileName);

  const url = existing
    ? `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart&fields=id`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id';
  const method = existing ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Upload failed');
  }
  const uploaded = await res.json();
  const fileId = uploaded.id;

  // Verificamos integridad comparando el checksum que almacena Drive
  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=md5Checksum`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const metaData = await metaRes.json();
  if (
    metaData.md5Checksum &&
    metaData.md5Checksum !== localMd5Hex &&
    metaData.md5Checksum !== localMd5Base64
  ) {
    throw new Error('Checksum mismatch after upload');
  }

  // Limita el historial de revisiones para evitar crecimiento indefinido
  const revRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/revisions?fields=revisions(id,modifiedTime)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (revRes.ok) {
    const revData = await revRes.json();
    const revisions = (revData.revisions || []).sort(
      (a, b) => new Date(a.modifiedTime) - new Date(b.modifiedTime)
    );
    while (revisions.length > MAX_REVISIONS) {
      const old = revisions.shift();
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/revisions/${old.id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }
  }

  return uploaded;
};

export const downloadBackupFromGoogleDrive = async (accessToken) => {
  if (Platform.OS !== 'web') {
    throw new Error('Solo disponible en la versión web.');
  }

  const listRes = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=name%20contains%20'RefriMudanza'" +
      "%20and%20trashed=false&spaces=appDataFolder&fields=files(id,name,modifiedTime)&orderBy=modifiedTime%20desc&pageSize=1",
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

  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=md5Checksum`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const metaData = await metaRes.json();

  const fileRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!fileRes.ok) {
    const text = await fileRes.text();
    throw new Error(text || 'Download failed');
  }
  const arrayBuffer = await fileRes.arrayBuffer();
  const remoteMd5 = metaData.md5Checksum;
  if (remoteMd5) {
    const localMd5 = SparkMD5.ArrayBuffer.hash(arrayBuffer);
    if (localMd5 !== remoteMd5) {
      throw new Error('Checksum mismatch');
    }
  }
  const zipData = new Uint8Array(arrayBuffer);
  await importBackupFromZipData(zipData);
};


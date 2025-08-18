import { Platform } from 'react-native';
import { createBackupFile, importBackupFromZipData } from './backup';

export const uploadBackupToGoogleDrive = async (accessToken) => {
  const file = await createBackupFile();
  if (Platform.OS !== 'web') {
    throw new Error('Solo disponible en la versión web.');
  }

  // Google Drive requiere un cuerpo `multipart/related`. El uso de FormData
  // produce `multipart/form-data` y provoca errores 400. Construimos el cuerpo
  // manualmente para asegurar compatibilidad.
  const metadata = { name: file.name, mimeType: 'application/zip' };
  const boundary = 'refriBoundary';
  const bodyStart = `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    'Content-Type: application/zip\r\n\r\n';
  const bodyEnd = `\r\n--${boundary}--`;
  const blobBuffer = await file.blob.arrayBuffer();
  const bodyUint8 = new Uint8Array([
    ...new TextEncoder().encode(bodyStart),
    ...new Uint8Array(blobBuffer),
    ...new TextEncoder().encode(bodyEnd),
  ]);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: bodyUint8,
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

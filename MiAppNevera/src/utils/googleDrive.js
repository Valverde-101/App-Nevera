import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
let accessToken = null;

export const signInWithGoogle = async () => {
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: Platform.OS !== 'web',
  });
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SCOPES.join(' '))}`;
  const result = await AuthSession.startAsync({ authUrl, returnUrl: redirectUri });
  if (result.type === 'success' && result.params.access_token) {
    accessToken = result.params.access_token;
    return accessToken;
  }
  throw new Error(result.params?.error_description || 'Google sign-in cancelled or failed');
};

export const uploadFileToDrive = async (name, base64Data) => {
  if (!accessToken) {
    await signInWithGoogle();
  }
  const boundary = 'foo_bar_baz';
  const metadata = { name, mimeType: 'application/zip' };
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/zip',
    'Content-Transfer-Encoding: base64',
    '',
    base64Data,
    `--${boundary}--`,
    '',
  ].join('\r\n');

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
  return await response.json();
};

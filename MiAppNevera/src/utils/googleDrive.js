import * as AuthSession from 'expo-auth-session';

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
let accessToken = null;

export const signInWithGoogle = async () => {
  if (!CLIENT_ID) {
    throw new Error('Missing EXPO_PUBLIC_GOOGLE_CLIENT_ID environment variable');
  }
  // Always use the Expo proxy so the OAuth flow works without additional
  // redirect URI configuration on web or native platforms.
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(SCOPES.join(' '))}` +
    `&prompt=select_account`;
  const result = await AuthSession.startAsync({ authUrl });
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

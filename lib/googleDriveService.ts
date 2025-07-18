// lib/googleDriveService.ts
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

// Replace with your actual Google OAuth client ID
const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const REDIRECT_URI = AuthSession.makeRedirectUri({});
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

export async function signInWithGoogle(): Promise<string> {
  const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=${encodeURIComponent(SCOPE)}`;
  // Cast AuthSession as any to access startAsync
  const result = await (AuthSession as any).startAsync({ authUrl });
  if (result.type === 'success' && result.params.code) {
    const code = result.params.code;
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `code=${code}&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&grant_type=authorization_code`,
    });
    const tokenData = await response.json();
    if (tokenData.access_token) {
      return tokenData.access_token;
    }
    throw new Error('Failed to obtain access token.');
  }
  throw new Error('Google sign-in cancelled or failed.');
}

export async function backupDataToGoogleDrive(
  accessToken: string,
  data: any
): Promise<any> {
  const fileMetadata = {
    name: 'finance_backup.json',
    parents: ['appDataFolder'],
  };

  const fileContent = JSON.stringify(data);
  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' })
  );
  form.append(
    'file',
    new Blob([fileContent], { type: 'application/json' })
  );

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );
  return response.json();
}

export async function restoreDataFromGoogleDrive(
  accessToken: string
): Promise<any> {
  const listResponse = await fetch(
    "https://www.googleapis.com/drive/v3/files?q='appDataFolder'+in+parents+and+name='finance_backup.json'&fields=files(id, name)",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const listData = await listResponse.json();
  if (listData.files && listData.files.length > 0) {
    const fileId = listData.files[0].id;
    const downloadResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const fileContent = await downloadResponse.text();
    return JSON.parse(fileContent);
  }
  throw new Error('No backup found in Google Drive.');
}

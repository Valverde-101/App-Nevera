import React, { createContext, useContext, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '388689708365-54q3jlb6efa8dm3fkfcrbsk25pb41s27.apps.googleusercontent.com',
    webClientId: '388689708365-54q3jlb6efa8dm3fkfcrbsk25pb41s27.apps.googleusercontent.com',
    scopes: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/drive.appdata'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      setToken(response.authentication.accessToken);
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${response.authentication.accessToken}` },
      })
        .then(res => res.json())
        .then(setUser)
        .catch(() => {});
    }
  }, [response]);

  const signIn = () => promptAsync();
  const signOut = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

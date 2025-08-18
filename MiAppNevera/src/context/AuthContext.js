import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '388689708365-54q3jlb6efa8dm3fkfcrbsk25pb41s27.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({ useProxy: Platform.select({ web: false }) }),
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      })
        .then(res => res.json())
        .then(async data => {
          const userInfo = { ...data, accessToken: authentication.accessToken };
          setUser(userInfo);
          await AsyncStorage.setItem('googleUser', JSON.stringify(userInfo));
        })
        .catch(err => console.error('Failed to fetch user info', err));
    }
  }, [response]);

  useEffect(() => {
    AsyncStorage.getItem('googleUser').then(saved => {
      if (saved) setUser(JSON.parse(saved));
    });
  }, []);

  const signInWithGoogle = () => {
    promptAsync({ useProxy: false });
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('googleUser');
  };

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


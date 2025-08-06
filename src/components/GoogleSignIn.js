import React from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleSignIn = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '759342814511-4cq0ps536nhjrh7va0er8jgeanagppv2.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });

  const signInWithGoogle = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web implementation would go here
        throw new Error('Web Google sign-in not implemented');
      } else {
        // Mobile implementation
        console.log('Starting Google sign-in...');
        const result = await promptAsync();
        console.log('Google sign-in result:', result);
        
        if (result?.type === 'success') {
          const { id_token } = result.params;
          console.log('Got ID token, creating credential...');
          const credential = GoogleAuthProvider.credential(id_token);
          const userCredential = await signInWithCredential(auth, credential);
          console.log('Google sign-in successful:', userCredential.user.uid);
          return userCredential.user;
        } else if (result?.type === 'cancel') {
          throw new Error('Google sign-in was cancelled by user');
        } else {
          console.log('Google sign-in failed with result:', result);
          throw new Error('Google sign-in failed - please check your Google Cloud Console configuration');
        }
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  return { signInWithGoogle };
}; 
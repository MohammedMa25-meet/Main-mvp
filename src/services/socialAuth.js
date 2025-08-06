import { signInWithCredential, signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, appleProvider } from './firebase';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const handleGoogleSignIn = async () => {
  try {
    // For web, use popup
    if (Platform.OS === 'web') {
      const result = await signInWithPopup(auth, googleProvider);
      return await handleAuthResult(result.user);
    } else {
      // For mobile, we'll use a different approach
      // You'll need to implement this in the WelcomeScreen component
      throw new Error('Google sign-in for mobile needs to be implemented in the component. Please use the useGoogleSignIn hook in WelcomeScreen.');
    }
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const handleAppleSignIn = async () => {
  try {
    if (Platform.OS === 'ios') {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken } = credential;
      if (identityToken) {
        const appleCredential = OAuthProvider.credential('apple.com', identityToken);
        const result = await signInWithCredential(auth, appleCredential);
        return await handleAuthResult(result.user, {
          fullName: credential.fullName,
          email: credential.email,
        });
      }
    } else {
      // For web, use popup
      const result = await signInWithPopup(auth, appleProvider);
      return await handleAuthResult(result.user);
    }
  } catch (error) {
    console.error('Apple Sign-In Error:', error);
    throw error;
  }
};

export const handleAuthResult = async (user, additionalData = {}) => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // User exists, return their data
      console.log('Existing user found:', user.uid);
      return {
        user: user,
        userData: userDoc.data(),
        isNewUser: false
      };
    } else {
      // New user, create basic profile
      console.log('New user created:', user.uid);
      const newUserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || additionalData.fullName?.givenName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        // Add any additional data from Apple sign-in
        ...additionalData
      };

      await setDoc(userDocRef, newUserData);
      
      return {
        user: user,
        userData: newUserData,
        isNewUser: true
      };
    }
  } catch (error) {
    console.error('Error handling auth result:', error);
    throw error;
  }
}; 
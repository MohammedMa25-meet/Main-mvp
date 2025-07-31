import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
// Import Firebase services
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const WelcomeScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { updateUserData } = useUser();

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('Error'), t('Please fill in all fields'));
      return;
    }

    setIsLoading(true);
    try {
      // 1. Sign in the user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Firebase user signed in successfully:', user.uid);

      // 2. Fetch the user's data document from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      // ✅ --- THIS IS THE FIX --- ✅
      // Check if the document actually exists before trying to use it.
      if (userDoc.exists()) {
        console.log('User data found in Firestore.');
        // 3. Save the fetched data to our global context
        updateUserData(userDoc.data());
        // 4. Navigate to the main app
        navigation.navigate('MainScreen');
      } else {
        // If the document doesn't exist, the user's profile is incomplete.
        console.error('Firestore document not found for user:', user.uid);
        // We can navigate them to the questionnaire to complete their profile.
        Alert.alert(
          t('Profile Incomplete'),
          t('Your profile is not complete. Please answer a few questions to continue.'),
          [{ text: 'OK', onPress: () => navigation.navigate('Questionnaire', {
              userAuth: { uid: user.uid, email: user.email },
              userData: {} // Pass empty data since we have none
            })
          }]
        );
      }

    } catch (error) {
      console.error('Firebase Login Error:', error);
      Alert.alert(t('Error'), t('Invalid email or password. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality would be implemented here');
  };
  const handleSignUp = () => {
    navigation.navigate('Registration');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.languageToggle} onPress={toggleLanguage}><Text style={styles.languageText}>{language}</Text><Ionicons name="language" size={20} color="#6b7280" /></TouchableOpacity>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}><Image source={require('../../assets/Bridge_it_logo.png')} style={styles.logoImage} resizeMode="contain" /></View>
            <Text style={styles.title}>{t('Welcome to Bridge-IT')}</Text>
            <Text style={styles.subtitle}>{t('Sign in to continue')}</Text>
          </View>
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}><Text style={styles.inputLabel}>{t('Email')}</Text><View style={styles.inputWrapper}><Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} /><TextInput style={styles.textInput} placeholder="you@example.com" placeholderTextColor="#9ca3af" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} /></View></View>
            <View style={styles.inputContainer}><Text style={styles.inputLabel}>{t('Password')}</Text><View style={styles.inputWrapper}><Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} /><TextInput style={styles.textInput} placeholder="••••••••" placeholderTextColor="#9ca3af" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} /><TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}><Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#9ca3af" /></TouchableOpacity></View></View>
            <TouchableOpacity style={[styles.signInButton, isLoading && styles.buttonDisabled]} onPress={handleEmailLogin} disabled={isLoading} activeOpacity={0.8}>
              {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.signInButtonText}>{t('Sign in')}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}><Text style={styles.forgotPasswordText}>{t('Forgot password?')}</Text></TouchableOpacity>
            <View style={styles.signUpContainer}><Text style={styles.signUpText}>{t('Need an account? ')}</Text><TouchableOpacity onPress={handleSignUp}><Text style={styles.signUpLink}>{t('Sign up')}</Text></TouchableOpacity></View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  languageToggle: { position: 'absolute', top: 20, right: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, zIndex: 1000 },
  languageText: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginRight: 6 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { marginBottom: 20 },
  logoImage: { width: 250, height: 120 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1f2937', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  formContainer: { backgroundColor: '#ffffff', borderRadius: 16, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 12 },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, fontSize: 16, color: '#1f2937', paddingVertical: 4 },
  eyeIcon: { padding: 4 },
  signInButton: { backgroundColor: '#1e293b', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  buttonDisabled: { opacity: 0.7 },
  signInButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  forgotPasswordButton: { alignSelf: 'center', paddingVertical: 8, marginBottom: 24 },
  forgotPasswordText: { color: '#6b7280', fontSize: 14 },
  signUpContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signUpText: { color: '#6b7280', fontSize: 14 },
  signUpLink: { color: '#1e40af', fontSize: 14, fontWeight: '500' },
});

export default WelcomeScreen;
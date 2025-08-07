import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator, // ✅ We need this for the loading state
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

// ✅ Import all the working Firebase logic
import { useUser } from '../context/UserContext';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { handleAppleSignIn, handleAuthResult } from '../services/socialAuth';
import { useGoogleSignIn } from '../components/GoogleSignIn';

const WelcomeScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { updateUserData } = useUser(); // ✅ From your working code
  const { signInWithGoogle } = useGoogleSignIn();

  // ✅ This is your fully functional handleEmailLogin function
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('Error'), t('Please fill in all fields'));
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Firebase user signed in successfully:', user.uid);

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log('User data found in Firestore.');
        updateUserData(userDoc.data());
        navigation.navigate('MainScreen');
      } else {
        console.error('Firestore document not found for user:', user.uid);
        Alert.alert(
          t('Profile Incomplete'),
          t('Your profile is not complete. Please answer a few questions to continue.'),
          [{ text: 'OK', onPress: () => navigation.navigate('Questionnaire', {
              userAuth: { uid: user.uid, email: user.email },
              userData: {}
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      let result;
      
      if (Platform.OS === 'web') {
        // For web, use the socialAuth service
        const { handleGoogleSignIn } = await import('../services/socialAuth');
        result = await handleGoogleSignIn();
      } else {
        // For mobile, use the hook
        const user = await signInWithGoogle();
        result = await handleAuthResult(user);
      }
      
      if (result.isNewUser) {
        // New user, redirect to questionnaire
        Alert.alert(
          t('Welcome!'),
          t('Please complete your profile by answering a few questions.'),
          [{ text: 'OK', onPress: () => navigation.navigate('Questionnaire', {
              userAuth: { uid: result.user.uid, email: result.user.email },
              userData: result.userData
            })
          }]
        );
      } else {
        // Existing user, go to main screen
        updateUserData(result.userData);
        navigation.navigate('MainScreen');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      let errorMessage = t('Google sign-in failed. Please try again.');
      
      if (error.message.includes('cancelled')) {
        errorMessage = t('Google sign-in was cancelled.');
      } else if (error.message.includes('configuration')) {
        errorMessage = t('Google sign-in is not properly configured. Please contact support.');
      }
      
      Alert.alert(t('Error'), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await handleAppleSignIn();
      
      if (result.isNewUser) {
        // New user, redirect to questionnaire
        Alert.alert(
          t('Welcome!'),
          t('Please complete your profile by answering a few questions.'),
          [{ text: 'OK', onPress: () => navigation.navigate('Questionnaire', {
              userAuth: { uid: result.user.uid, email: result.user.email },
              userData: result.userData
            })
          }]
        );
      } else {
        // Existing user, go to main screen
        updateUserData(result.userData);
        navigation.navigate('MainScreen');
      }
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      Alert.alert(t('Error'), t('Apple sign-in failed. Please try again.'));
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
      <TouchableOpacity style={styles.languageToggle} onPress={toggleLanguage}>
        <Text style={styles.languageText}>{language}</Text>
        <Ionicons name="language" size={20} color="#11523d" />
      </TouchableOpacity>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.phoneContainer}>
            <View style={styles.topSection}>
              <LinearGradient
                colors={['#11523d', '#bb9704']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
              >
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../../assets/BridgeIt_Symbol.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </LinearGradient>
              <View style={styles.waveContainer}>
                <Svg height="160" width="100%" viewBox="0 0 400 120" style={styles.wave}>
                  <Path
                    d="M0,40 C80,0 120,80 200,60 C280,40 320,90 400,70 L400,120 L0,120 Z"
                    fill="#ffffff"
                  />
                </Svg>
              </View>
            </View>
            <View style={styles.bottomSection}>
              <Text style={styles.title}>{t('Hello')}</Text>
              <Text style={styles.subtitle}>{t('Sign in to your account')}</Text>
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('Email')}
                    placeholderTextColor="#bbb"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="••••••••"
                      placeholderTextColor="#bbb"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  style={styles.forgotButton}
                >
                  <Text style={styles.forgotText}>{t('Forgot your Password?')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={handleEmailLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#11523d', '#bb9704']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.signInText}>{t('SIGN IN')}</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.newAccountInButton}
                  onPress={handleSignUp}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <View style={styles.whiteButtonContainer}>
                    <Text style={styles.createAccountText}>{t('CREATE AN ACCOUNT')}</Text>
                  </View>
                </TouchableOpacity>

                {/* Social Login Section */}
                <View style={styles.socialLoginContainer}>
                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>{t('OR')}</Text>
                    <View style={styles.divider} />
                  </View>
                  
                  <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleLogin}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-google" size={20} color="#DB4437" />
                    <Text style={styles.googleButtonText}>{t('Continue with Google')}</Text>
                  </TouchableOpacity>

                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      style={styles.appleButton}
                      onPress={handleAppleLogin}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="logo-apple" size={20} color="#000000" />
                      <Text style={styles.appleButtonText}>{t('Continue with Apple')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ✅ These are the styles from the new design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf7f5',
  },
  languageToggle: {
    position: 'absolute',
    top: 150,
    right: 28,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11523d',
    marginRight: 6,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  phoneContainer: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    minHeight: 600,
  },
  topSection: {
    height: 280,
    position: 'relative',
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  logoContainer: {
    borderRadius: 20,
    padding: 15,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoImage: {
    width: 400, // Adjusted for better fit
    height: 400,
    bottom: 25,
     // Adjusted for better fit
  },
  waveContainer: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
  },
  wave: {
    width: '100%',
    height: 120,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 40,
    textAlign: 'left',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 25,
  },
  textInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 0,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotText: {
    color: '#bbb',
    fontSize: 14,
  },
  signInButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20, // Adjusted margin
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  newAccountInButton: {
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#11523d',
    backgroundColor: '#ffffff',
  },
  whiteButtonContainer: {
    paddingVertical: 14, // Adjusted padding
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 23,
  },
  createAccountText: {
    color: '#11523d',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  socialLoginContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '80%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  googleButtonText: {
    marginLeft: 10,
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  appleButtonText: {
    marginLeft: 10,
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
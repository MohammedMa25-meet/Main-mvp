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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('MainScreen');
    }, 1500);
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality would be implemented here');
  };

  const handleSignUp = () => {
    navigation.navigate('Registration');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Language Toggle Button */}
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
          {/* Phone Mockup Container */}
          <View style={styles.phoneContainer}>
            {/* Curved Top Section with Gradient and Waves */}
            <View style={styles.topSection}>
              <LinearGradient
                colors={['#11523d', '#bb9704']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
              >
                {/* Logo - Easy to replace */}
                <View style={styles.logoContainer}>
                  <Image 
                    source={require('../../assets/BridgeIt_Symbol.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </LinearGradient>
              {/* Wave Shape - More flowy */}
              <View style={styles.waveContainer}>
                <Svg height="160" width="100%" viewBox="0 0 400 120" style={styles.wave}>
                  <Path
                    d="M0,40 C80,0 120,80 200,60 C280,40 320,90 400,70 L400,120 L0,120 Z"
                    fill="#ffffff"
                  />
                </Svg>
              </View>
            </View>
            {/* White Bottom Section */}
            <View style={styles.bottomSection}>
              {/* Title */}
              <Text style={styles.title}>Hello</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
              {/* Form */}
              <View style={styles.formContainer}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="john@email.com"
                    placeholderTextColor="#bbb"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="••••"
                      placeholderTextColor="#bbb"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Text style={styles.eyeText}>👁</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Forgot Password */}
                <TouchableOpacity 
                  onPress={handleForgotPassword}
                  style={styles.forgotButton}
                >
                  <Text style={styles.forgotText}>Forgot your Password?</Text>
                </TouchableOpacity>
                {/* Sign In Button */}
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
                    <Text style={styles.signInText}>
                      {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                {/* Sign Up button */}
                <TouchableOpacity 
                  style={styles.newAccountInButton}
                  onPress={handleSignUp}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <View style={styles.whiteButtonContainer}>
                    <Text style={styles.createAccountText}>CREATE AN ACCOUNT</Text>
                  </View>
                </TouchableOpacity>
                
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf7f5',
  },
  languageToggle: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
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
  safeArea: {
    flex: 1,
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
    shadowOffset: {
      width: 0,
      height: 10,
    },
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
    width: 500,
    height: 500,
    top: -30,
  },
  waveContainer: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    height: 120,
  },
  wave: {
    width: '100%',
    height: '100%',
    top: -10,
  },
  bottomSection: {
    flex: 3,
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
    paddingVertical: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 4,
  },
  eyeText: {
    fontSize: 16,
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
    marginBottom: 30,
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
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newAccountInButton: {
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#ffffff',
    marginBottom: 0,
  },
  whiteButtonContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 23,
  },
  createAccountText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  signUpLink: {
    color: '#11523d',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useDarkMode } from '../context/DarkModeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';

// Import all necessary services
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { uploadFile } from '../services/appwriteService'; // For CV Uploads
import { runFullAiAnalysis } from '../services/aiService'; // The main AI "Orchestrator"

const QuestionnaireScreen = ({ navigation, route }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [answers, setAnswers] = useState({
    careerGoal: '',
    region: '',
    experience: '',
    field: [],
    languages: [],
    cvFiles: [],
  });

  const { isDarkMode } = useDarkMode();
  const { t } = useLanguage();
  const { updateUserData } = useUser();
  const { userAuth, userData: initialUserData } = route.params;

  const questions = useMemo(() => [
    {
      id: 'careerGoal',
      question: t('Hey there, what are you looking for?'),
      type: 'single',
      options: [
        t('Looking for a new career'),
        t('Continuing my education'),
        t('Finding a job in my field of expertise'),
        t('Receiving new certification'),
        t('Other')
      ]
    },
    {
      id: 'region',
      question: t('Where do you live in the west bank?'),
      type: 'text',
      placeholder: t('Type in the region')
    },
    {
      id: 'experience',
      question: t('What Prior Experience do you have?'),
      type: 'single',
      options: [
        t('Bachelor\'s or Undergraduate'),
        t('Higher form of Education'),
        t('Field Experience'),
        t('High school Diploma'),
        t('Other')
      ]
    },
    {
      id: 'field',
      question: t('What field is your experience in? (multiple answer)'),
      type: 'multiple',
      options: [
        t('IT- ICT'),
        t('Data Analysis'),
        t('Cybersecurity'),
        t('Social & behavioural sci.'),
        t('AI Consulting'),
        t('Other')
      ]
    },
    {
      id: 'languages',
      question: t('What languages are you fluent in? (multiple answer)'),
      type: 'multiple',
      options: [
        t('Arabic'),
        t('English'),
        t('French'),
        t('Other')
      ]
    }
  ], [t]);

  const totalQuestions = questions.length + 1; // +1 for CV upload page
  const progress = ((currentPage + 1) / totalQuestions) * 100;

  useEffect(() => {
    setCurrentPage(0);
  }, []);

  const handleAnswer = (questionId, answer) => {
    if (questions[currentPage]?.type === 'multiple') {
      const currentAnswers = answers[questionId] || [];
      const newAnswers = currentAnswers.includes(answer)
        ? currentAnswers.filter(a => a !== answer)
        : [...currentAnswers, answer];
      setAnswers({ ...answers, [questionId]: newAnswers });
    } else {
      setAnswers({ ...answers, [questionId]: answer });
    }
  };

  const handleNext = () => {
    // Navigate to CV upload page after last question
    if (currentPage >= questions.length - 1) {
        setCurrentPage(currentPage + 1);
        return;
    }

    const currentQuestion = questions[currentPage];
    if (!answers[currentQuestion.id] || (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0)) {
      Alert.alert(t('Error'), t('Please answer the question before continuing.'));
      return;
    }
    setCurrentPage(currentPage + 1);
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        multiple: true,
      });

      if (!result.canceled) {
        const newFiles = result.assets.map(file => ({
          name: file.name,
          uri: file.uri,
          size: file.size,
        }));
        setAnswers({ ...answers, cvFiles: [...answers.cvFiles, ...newFiles] });
      }
    } catch (error) {
      Alert.alert(t('Error'), t('Failed to upload file. Please try again.'));
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = answers.cvFiles.filter((_, i) => i !== index);
    setAnswers({ ...answers, cvFiles: newFiles });
  };

  const handleSkipCV = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    setLoading(true);
    let cvUrls = [];

    try {
      setLoadingText(t('Uploading documents...'));
      // 1. Upload CV files to Appwrite if they exist
      if (answers.cvFiles.length > 0) {
        const uploadPromises = answers.cvFiles.map(file => uploadFile(file, userAuth.uid));
        cvUrls = await Promise.all(uploadPromises);
      }

      // 2. Prepare the complete user profile
      const finalUserData = {
        ...initialUserData,
        ...answers,
        uid: userAuth.uid,
        email: userAuth.email,
        cvUrls: cvUrls, // Store the array of URLs from Appwrite
        createdAt: new Date(),
      };
      delete finalUserData.cvFiles; // Clean up local file info

      setLoadingText(t('Saving your profile...'));
      // 3. Save the initial profile to Firestore
      const userDocRef = doc(db, 'users', userAuth.uid);
      await setDoc(userDocRef, finalUserData);
      console.log('User profile created in Firestore successfully!');

      setLoadingText(t('AI is analyzing your profile... This may take a moment.'));
      // 4. Call the full AI analysis orchestrator. It handles everything else.
      const { recommendedCourses, recommendedJobs } = await runFullAiAnalysis(finalUserData);
      
      // 5. Update the global context with the final, complete user data
      const completeUserData = { ...finalUserData, recommendedCourses, recommendedJobs, analysisComplete: true, lastAnalysisDate: new Date() };
      updateUserData(completeUserData);
      
      setLoading(false);
      Alert.alert(t('Success'), t('Registration completed successfully!'), [
        { text: t('OK'), onPress: () => navigation.navigate('MainScreen') }
      ]);

    } catch (error) {
      setLoading(false);
      console.error('Error during final registration step:', error);
      Alert.alert(t('Error'), t('There was a problem saving your profile. We will try to generate recommendations later.'));
      // Still navigate to the main screen even if AI fails, so the user isn't stuck
      navigation.navigate('MainScreen');
    }
  };

  const renderQuestion = () => {
    if (currentPage < questions.length) {
      const question = questions[currentPage];
      const currentAnswer = answers[question.id];
      return (
        <ScrollView style={styles.questionScrollView} contentContainerStyle={styles.questionScrollContent}>
          <View style={[styles.questionContainer, isDarkMode && styles.questionContainerDark]}>
            <Text style={[styles.questionText, isDarkMode && styles.questionTextDark]}>{question.question}</Text>
            {question.type === 'text' ? (
              <TextInput style={[styles.textInput, isDarkMode && styles.textInputDark]} placeholder={question.placeholder} placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'} value={currentAnswer || ''} onChangeText={(text) => handleAnswer(question.id, text)} />
            ) : (
              <View style={styles.optionsContainer}>
                {question.options.map((option, index) => (
                  <TouchableOpacity key={index} style={[styles.optionButton, isDarkMode && styles.optionButtonDark, (question.type === 'single' && currentAnswer === option) && styles.selectedOption, (question.type === 'multiple' && currentAnswer?.includes(option)) && styles.selectedOption]} onPress={() => handleAnswer(question.id, option)}>
                    <Text style={[styles.optionText, isDarkMode && styles.optionTextDark, (question.type === 'single' && currentAnswer === option) && styles.selectedOptionText, (question.type === 'multiple' && currentAnswer?.includes(option)) && styles.selectedOptionText]}>{option}</Text>
                    {question.type === 'multiple' && currentAnswer?.includes(option) && (<Ionicons name="checkmark-circle" size={20} color="#556B2F" />)}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      );
    } else {
      return (
        <View style={[styles.cvContainer, isDarkMode && styles.cvContainerDark]}>
          <Text style={[styles.questionText, isDarkMode && styles.questionTextDark]}>{t('Please enter your credentials and resume')}</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}><Ionicons name="cloud-upload-outline" size={24} color="#10B981" /><Text style={styles.uploadButtonText}>{t('Upload CV/Resume')}</Text></TouchableOpacity>
          {answers.cvFiles.length > 0 && (<View style={styles.filesContainer}><Text style={[styles.filesTitle, isDarkMode && styles.filesTitleDark]}>{t('Uploaded Files:')}</Text>{answers.cvFiles.map((file, index) => (<View key={index} style={[styles.fileItem, isDarkMode && styles.fileItemDark]}><Ionicons name="document-outline" size={20} color="#6B7280" /><Text style={[styles.fileName, isDarkMode && styles.fileNameDark]} numberOfLines={1}>{file.name}</Text><TouchableOpacity onPress={() => handleRemoveFile(index)}><Ionicons name="close-circle" size={20} color="#EF4444" /></TouchableOpacity></View>))}</View>)}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkipCV}><Text style={[styles.skipButtonText, isDarkMode && styles.skipButtonTextDark]}>{t('Skip CV Upload')}</Text></TouchableOpacity>
        </View>
      );
    }
  };

  const containerStyle = isDarkMode ? styles.containerDark : styles.container;
  const headerStyle = isDarkMode ? styles.headerDark : styles.header;
  const progressContainerStyle = isDarkMode ? styles.progressContainerDark : styles.progressContainer;
  const progressTextStyle = isDarkMode ? styles.progressTextDark : styles.progressText;
  const navigationContainerStyle = isDarkMode ? styles.navigationContainerDark : styles.navigationContainer;

  return (
    <SafeAreaView style={containerStyle}>
      {loading && (<View style={styles.loadingOverlay}><View style={[styles.loadingContent, isDarkMode && styles.loadingContentDark]}><ActivityIndicator size="large" color="#556B2F" /><Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>{loadingText}</Text></View></View>)}
      <View style={headerStyle}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}><Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFFFFF" : "#1F2937"} /></TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>{currentPage < questions.length ? t('Questionnaire') : t('CV Upload')}</Text>
        <View style={styles.headerRight} />
      </View>
      <View style={progressContainerStyle}>
        <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
        <Text style={progressTextStyle}>{Math.round(progress)}% {t('Complete')}</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>{renderQuestion()}</ScrollView>
      <View style={navigationContainerStyle}>
        {currentPage < totalQuestions - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}><Text style={styles.nextButtonText}>{t('Next')}</Text><Ionicons name="arrow-forward" size={20} color="#FFFFFF" /></TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}><Text style={styles.finishButtonText}>{t('Finish Registration')}</Text></TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { flex: 1, backgroundColor: '#111827' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  loadingContent: { backgroundColor: '#FFFFFF', padding: 30, borderRadius: 16, alignItems: 'center' },
  loadingContentDark: { backgroundColor: '#1F2937' },
  loadingText: { marginTop: 16, fontSize: 18, fontWeight: '600', color: '#1F2937' },
  loadingTextDark: { color: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerDark: { backgroundColor: '#1F2937', borderBottomColor: '#374151' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  headerTitleDark: { color: '#F9FAFB' },
  headerRight: { width: 40 },
  progressContainer: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF' },
  progressContainerDark: { backgroundColor: '#1F2937' },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#556B2F', borderRadius: 4 },
  progressText: { marginTop: 8, fontSize: 14, color: '#6B7280', textAlign: 'center' },
  progressTextDark: { color: '#D1D5DB' },
  content: { flex: 1, paddingHorizontal: 20, paddingVertical: 24 },
  questionScrollView: { flex: 1 },
  questionScrollContent: { flexGrow: 1 },
  questionContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  questionContainerDark: { backgroundColor: '#1F2937' },
  questionText: { fontSize: 20, fontWeight: '600', color: '#1F2937', marginBottom: 24, lineHeight: 28 },
  questionTextDark: { color: '#F9FAFB' },
  textInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1F2937', backgroundColor: '#FFFFFF' },
  textInputDark: { borderColor: '#374151', color: '#F9FAFB', backgroundColor: '#374151' },
  optionsContainer: { gap: 12 },
  optionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FFFFFF' },
  optionButtonDark: { borderColor: '#374151', backgroundColor: '#374151' },
  selectedOption: { borderColor: '#556B2F', backgroundColor: '#F0FDF4' },
  optionText: { fontSize: 16, color: '#374151', flex: 1 },
  optionTextDark: { color: '#D1D5DB' },
  selectedOptionText: { color: '#556B2F', fontWeight: '600' },
  cvContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cvContainerDark: { backgroundColor: '#1F2937' },
  uploadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 24, borderWidth: 2, borderColor: '#556B2F', borderStyle: 'dashed', borderRadius: 12, marginVertical: 16 },
  uploadButtonText: { marginLeft: 8, fontSize: 16, color: '#556B2F', fontWeight: '600' },
  filesContainer: { marginTop: 20 },
  filesTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  filesTitleDark: { color: '#F9FAFB' },
  fileItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#F9FAFB', borderRadius: 8, marginBottom: 8 },
  fileItemDark: { backgroundColor: '#374151' },
  fileName: { flex: 1, marginLeft: 8, fontSize: 14, color: '#374151' },
  fileNameDark: { color: '#D1D5DB' },
  skipButton: { alignItems: 'center', paddingVertical: 16, marginTop: 16 },
  skipButtonText: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  skipButtonTextDark: { color: '#9CA3AF' },
  navigationContainer: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  navigationContainerDark: { backgroundColor: '#1F2937', borderTopColor: '#374151' },
  nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#556B2F', paddingVertical: 16, borderRadius: 12 },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginRight: 8 },
  finishButton: { backgroundColor: '#556B2F', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  finishButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default QuestionnaireScreen;
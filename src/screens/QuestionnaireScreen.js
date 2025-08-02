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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useDarkMode } from '../context/DarkModeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
// ✅ Import Firebase services
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

const QuestionnaireScreen = ({ navigation, route }) => {
  const [currentPage, setCurrentPage] = useState(-1); // Start with AI explanation page
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({
    careerGoal: '',
    region: '',
    employmentStatus: '',
    experience: '',
    university: '',
    fieldExperience: [],
    fieldWish: [],
    dreamJob: '',
    remoteCountries: [],
    cvFiles: [],
  });
  const [showOtherInput, setShowOtherInput] = useState({});
  const [otherInputs, setOtherInputs] = useState({});
  const [showSubOptions, setShowSubOptions] = useState({});

  const { isDarkMode } = useDarkMode();
  const { t } = useLanguage();
  const { updateUserData } = useUser();

  // ✅ Get the user's auth info and initial data passed from the registration screen
  const { userAuth, userData: initialUserData, isRetake = false } = route.params;

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
      type: 'single',
      options: [
        t('Ramallah'),
        t('Hebron'),
        t('Nablus'),
        t('Bethlehem'),
        t('Jenin'),
        t('Tulkarm'),
        t('Qalqilya'),
        t('Other')
      ]
    },
    {
      id: 'employmentStatus',
      question: t('What is your current employment status?'),
      type: 'single',
      options: [
        t('Employed but not satisfied with my salary'),
        t('Employed but not in my field of study'),
        t('Recently laid off (up to 3 months)'),
        t('Unemployed for more than 3 months'),
        t('Never was employed before')
      ]
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
        t('Internship'),
        t('vocational training'),
        t('Other')
      ]
    },
    {
      id: 'university',
      question: t('What university did you attend?'),
      type: 'single',
      options: [
        t('Birzeit University'),
        t('An-Najah National University'),
        t('Hebron University'),
        t('Palestine Polytechnic University'),
        t('Al-Quds University'),
        t('Bethlehem University'),
        t('Arab American University'),
        t('Palestine Technical University'),
        t('Al-Quds Open University'),
        t('Khadoorie Technical University'),
        t('Dar Al-Kalima University'),
        t('University College of Applied Sciences'),
        t('Modern University College'),
        t('I didn\'t attend university'),
        t('Other')
      ]
    },
    {
      id: 'fieldExperience',
      question: t('What field/s is your experience in? (multiple answer)'),
      type: 'multiple',
      options: [
        {
          label: t('IT- ICT'),
          hasSubOptions: true,
          subOptions: [
            t('Software Development'),
            t('Network and Systems Administration'),
            t('Information Systems Management'),
            t('Telecommunications and Networking'),
            t('Mobile App Development'),
            t('UI/UX Design'),
            t('ICT Education and Training'),
            t('Cybersecurity'),
            t('Data Analysis'),
            t('Other')
          ]
        },
        {
          label: t('Social & Behavioural Sciences'),
          hasSubOptions: true,
          subOptions: [
            t('Psychology'),
            t('Sociology'),
            t('Anthropology'),
            t('Political Science'),
            t('Criminology'),
            t('Communication Studies'),
            t('International Relations'),
            t('Human Geography'),
            t('Education / Educational Sciences'),
            t('Social Work'),
            t('Other')
          ]
        },
        {
          label: t('AI Consulting'),
          hasSubOptions: false
        },
        {
          label: t('Other'),
          hasSubOptions: false
        }
      ]
    },
    {
      id: 'fieldWish',
      question: t('What field/s do you wish to work in? (multiple answer)'),
      type: 'multiple',
      options: [
        {
          label: t('IT- ICT'),
          hasSubOptions: true,
          subOptions: [
            t('Software Development'),
            t('Network and Systems Administration'),
            t('Information Systems Management'),
            t('Telecommunications and Networking'),
            t('Mobile App Development'),
            t('UI/UX Design'),
            t('ICT Education and Training'),
            t('Cybersecurity'),
            t('Data Analysis'),
            t('Other')
          ]
        },
        {
          label: t('Social & Behavioural Sciences'),
          hasSubOptions: true,
          subOptions: [
            t('Psychology'),
            t('Sociology'),
            t('Anthropology'),
            t('Political Science'),
            t('Criminology'),
            t('Communication Studies'),
            t('International Relations'),
            t('Human Geography'),
            t('Education / Educational Sciences'),
            t('Social Work'),
            t('Other')
          ]
        },
        {
          label: t('AI Consulting'),
          hasSubOptions: false
        },
        {
          label: t('Other'),
          hasSubOptions: false
        }
      ]
    },
    {
      id: 'dreamJob',
      question: t('What is your dream job?'),
      type: 'text',
      placeholder: t('Type your dream job')
    },
    {
      id: 'remoteCountries',
      question: t('In what countries are you interested in working remotely?'),
      type: 'multiple',
      options: [
        t('Bahrain'),
        t('Kuwait'),
        t('Oman'),
        t('Qatar'),
        t('Saudi Arabia'),
        t('United Arab Emirates'),
        t('Other')
      ]
    }
  ], [t]);

  const totalQuestions = questions.length + 2; // +1 for AI explanation page, +1 for CV upload page
  const progress = currentPage === -1 ? 0 : ((currentPage + 1) / (totalQuestions - 1)) * 100;

  useEffect(() => {
    // Always start from the AI explanation page when entering questionnaire
    // If it's a retake, skip the AI explanation and go directly to first question
    setCurrentPage(isRetake ? 0 : -1);
  }, [isRetake]);

  const handleAnswer = (questionId, answer, parentOption = null) => {
    if (questions[currentPage].type === 'multiple') {
      const currentAnswers = answers[questionId] || [];
      let newAnswers;
      
      if (parentOption) {
        // Handle sub-options
        const parentAnswers = currentAnswers.filter(a => !a.startsWith(parentOption + ' - '));
        if (currentAnswers.includes(answer)) {
          newAnswers = parentAnswers;
        } else {
          newAnswers = [...parentAnswers, answer];
        }
      } else {
        // Handle main options
        if (currentAnswers.includes(answer)) {
          newAnswers = currentAnswers.filter(a => a !== answer && !a.startsWith(answer + ' - '));
        } else {
          newAnswers = [...currentAnswers, answer];
        }
      }
      
      setAnswers({ ...answers, [questionId]: newAnswers });
    } else {
      setAnswers({ ...answers, [questionId]: answer });
    }
  };

  const handleOtherInput = (questionId, value, parentOption = null) => {
    const key = parentOption ? `${questionId}_${parentOption}` : questionId;
    setOtherInputs({ ...otherInputs, [key]: value });
    
    if (questions[currentPage].type === 'multiple') {
      const currentAnswers = answers[questionId] || [];
      const otherAnswer = parentOption ? `${parentOption} - ${value}` : value;
      
      // Remove any existing "Other" answer for this question/option
      const filteredAnswers = currentAnswers.filter(a => 
        !a.startsWith(parentOption ? `${parentOption} - ` : 'Other - ')
      );
      
      setAnswers({ ...answers, [questionId]: [...filteredAnswers, otherAnswer] });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const toggleSubOptions = (optionLabel) => {
    setShowSubOptions({ ...showSubOptions, [optionLabel]: !showSubOptions[optionLabel] });
  };

  const handleNext = () => {
    if (currentPage === -1) {
      // Move from AI explanation to first question
      setCurrentPage(0);
      return;
    }

    const currentQuestion = questions[currentPage];
    const currentAnswer = answers[currentQuestion.id];

    if (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)) {
      Alert.alert(t('Error'), t('Please answer the question before continuing.'));
      return;
    }

    if (currentPage < questions.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      setCurrentPage(currentPage + 1); // Move to CV upload page
    }
  };

  const handleBack = () => {
    if (currentPage === 0) {
      // Go back to AI explanation page
      setCurrentPage(-1);
    } else if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else {
      // If on the AI explanation page, navigate back to the registration screen
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
    
    // This is the complete user profile we will save to Firestore
    const finalUserData = {
      ...initialUserData, // Data from RegistrationScreen (firstName, lastName, etc.)
      ...answers,         // Data from this screen (careerGoal, region, etc.)
      uid: userAuth.uid,  // The unique ID from Firebase Auth
      email: userAuth.email,
      // TODO: Handle CV file uploads to Firebase Storage or Appwrite and save the URL here
      cvUrls: [], 
      createdAt: new Date(),
    };

    // We don't need to save the local file objects to Firestore, so we remove it
    delete finalUserData.cvFiles;

    try {
      // ✅ Save the complete user document to Firestore using the user's unique ID
      await setDoc(doc(db, 'users', userAuth.uid), finalUserData);
      console.log('User profile created in Firestore successfully!');

      // ✅ Update the global user context so the app knows the user is logged in
      updateUserData(finalUserData);
      
      setLoading(false);
      Alert.alert(t('Success'), t('Registration completed successfully!'), [
        { text: t('OK'), onPress: () => navigation.navigate('MainScreen') }
      ]);
    } catch (error) {
      setLoading(false);
      console.error('Error saving user data to Firestore:', error);
      Alert.alert(t('Error'), t('There was a problem saving your profile.'));
    }
  };

  const renderAIExplanation = () => {
    return (
      <View style={[styles.aiExplanationContainer, isDarkMode && styles.aiExplanationContainerDark]}>
        <View style={styles.aiIconContainer}>
          <Ionicons name="analytics" size={60} color="#556B2F" />
        </View>
        <Text style={[styles.aiTitle, isDarkMode && styles.aiTitleDark]}>
          {t('AI-Powered Career Analysis')}
        </Text>
        <Text style={[styles.aiDescription, isDarkMode && styles.aiDescriptionDark]}>
          {t('Our advanced AI will analyze your responses to provide personalized career recommendations, job matches, and learning paths tailored to your background and goals.')}
        </Text>
        <View style={styles.aiFeaturesContainer}>
          <View style={styles.aiFeature}>
            <Ionicons name="checkmark-circle" size={20} color="#556B2F" />
            <Text style={[styles.aiFeatureText, isDarkMode && styles.aiFeatureTextDark]}>
              {t('Personalized job recommendations')}
            </Text>
          </View>
          <View style={styles.aiFeature}>
            <Ionicons name="checkmark-circle" size={20} color="#556B2F" />
            <Text style={[styles.aiFeatureText, isDarkMode && styles.aiFeatureTextDark]}>
              {t('Custom learning paths')}
            </Text>
          </View>
          <View style={styles.aiFeature}>
            <Ionicons name="checkmark-circle" size={20} color="#556B2F" />
            <Text style={[styles.aiFeatureText, isDarkMode && styles.aiFeatureTextDark]}>
              {t('Career development insights')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderQuestion = () => {
    if (currentPage === -1) {
      return renderAIExplanation();
    }
    
    if (currentPage < questions.length) {
      const question = questions[currentPage];
      const currentAnswer = answers[question.id];

      return (
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 250 : 200}
        >
          <ScrollView
            style={styles.questionScrollView}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={[
              styles.questionScrollContent,
              question.id === 'dreamJob' && { paddingBottom: 300 }
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.questionContainer, isDarkMode && styles.questionContainerDark]}>
              <Text style={[styles.questionText, isDarkMode && styles.questionTextDark]}>{question.question}</Text>
              
              {question.type === 'text' ? (
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={[styles.textInput, isDarkMode && styles.textInputDark, question.id === 'dreamJob' && styles.dreamJobInput]}
                    placeholder={question.placeholder}
                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                    value={currentAnswer || ''}
                    onChangeText={(text) => handleAnswer(question.id, text)}
                    multiline={question.id === 'dreamJob'}
                    numberOfLines={question.id === 'dreamJob' ? 8 : 1}
                    textAlignVertical={question.id === 'dreamJob' ? 'top' : 'center'}
                  />
                </View>
              ) : (
                <View style={styles.optionsContainer}>
                  {question.options.map((option, index) => {
                    // Handle complex options with sub-options
                    if (typeof option === 'object' && option.hasSubOptions !== undefined) {
                      const isMainOptionSelected = currentAnswer?.some(answer => 
                        answer === option.label || answer.startsWith(option.label + ' - ')
                      );
                      
                      return (
                        <View key={index}>
                          <TouchableOpacity
                            style={[
                              styles.optionButton,
                              isDarkMode && styles.optionButtonDark,
                              isMainOptionSelected && styles.selectedOption,
                            ]}
                            onPress={() => {
                              if (option.hasSubOptions) {
                                toggleSubOptions(option.label);
                              } else {
                                handleAnswer(question.id, option.label);
                              }
                            }}
                          >
                            <Text style={[
                              styles.optionText,
                              isDarkMode && styles.optionTextDark,
                              isMainOptionSelected && styles.selectedOptionText,
                            ]}>
                              {option.label}
                            </Text>
                            {question.type === 'multiple' && isMainOptionSelected && (
                              <Ionicons name="checkmark-circle" size={20} color="#556B2F" />
                            )}
                            {option.hasSubOptions && (
                              <Ionicons 
                                name={showSubOptions[option.label] ? "chevron-up" : "chevron-down"} 
                                size={20} 
                                color={isDarkMode ? "#D1D5DB" : "#374151"} 
                              />
                            )}
                          </TouchableOpacity>
                          
                          {option.hasSubOptions && showSubOptions[option.label] && (
                            <View style={styles.subOptionsContainer}>
                              {option.subOptions.map((subOption, subIndex) => {
                                const isSubSelected = currentAnswer?.includes(`${option.label} - ${subOption}`);
                                
                                return (
                                  <View key={subIndex}>
                                    <TouchableOpacity
                                      style={[
                                        styles.subOptionButton,
                                        isDarkMode && styles.subOptionButtonDark,
                                        isSubSelected && styles.selectedSubOption,
                                      ]}
                                      onPress={() => {
                                        if (subOption === t('Other')) {
                                          setShowOtherInput({ 
                                            ...showOtherInput, 
                                            [`${question.id}_${option.label}`]: !showOtherInput[`${question.id}_${option.label}`] 
                                          });
                                        } else {
                                          handleAnswer(question.id, `${option.label} - ${subOption}`, option.label);
                                        }
                                      }}
                                    >
                                      <Text style={[
                                        styles.subOptionText,
                                        isDarkMode && styles.subOptionTextDark,
                                        isSubSelected && styles.selectedSubOptionText,
                                      ]}>
                                        {subOption}
                                      </Text>
                                      {question.type === 'multiple' && isSubSelected && (
                                        <Ionicons name="checkmark-circle" size={20} color="#556B2F" />
                                      )}
                                      {subOption === t('Other') && (
                                        <Ionicons 
                                          name={showOtherInput[`${question.id}_${option.label}`] ? "chevron-up" : "chevron-down"} 
                                          size={20} 
                                          color={isDarkMode ? "#D1D5DB" : "#374151"} 
                                        />
                                      )}
                                    </TouchableOpacity>
                                    
                                    {subOption === t('Other') && showOtherInput[`${question.id}_${option.label}`] && (
                                      <View style={styles.otherInputContainer}>
                                        <View style={styles.arrowContainer}>
                                          <Ionicons name="arrow-forward" size={16} color="#556B2F" style={styles.arrowIcon} />
                                        </View>
                                        <TextInput
                                          style={[styles.otherTextInput, isDarkMode && styles.otherTextInputDark]}
                                          placeholder={t('Type your specialization')}
                                          placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                          value={otherInputs[`${question.id}_${option.label}`] || ''}
                                          onChangeText={(text) => handleOtherInput(question.id, text, option.label)}
                                        />
                                      </View>
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                          )}
                        </View>
                      );
                    }
                    
                    // Handle simple options (including AI Consulting and Other)
                    const isSelected = question.type === 'single' 
                      ? currentAnswer === option
                      : currentAnswer?.includes(option);
                    
                    const isOtherOption = option === t('Other');
                    
                    return (
                      <View key={index}>
                        <TouchableOpacity
                          style={[
                            styles.optionButton,
                            isDarkMode && styles.optionButtonDark,
                            isSelected && styles.selectedOption,
                          ]}
                          onPress={() => {
                            if (isOtherOption) {
                              setShowOtherInput({ ...showOtherInput, [question.id]: !showOtherInput[question.id] });
                            } else {
                              handleAnswer(question.id, option);
                            }
                          }}
                        >
                          <Text style={[
                            styles.optionText,
                            isDarkMode && styles.optionTextDark,
                            isSelected && styles.selectedOptionText,
                          ]}>
                            {option}
                          </Text>
                          {question.type === 'multiple' && isSelected && (
                            <Ionicons name="checkmark-circle" size={20} color="#556B2F" />
                          )}
                          {isOtherOption && (
                            <Ionicons 
                              name={showOtherInput[question.id] ? "chevron-up" : "chevron-down"} 
                              size={20} 
                              color={isDarkMode ? "#D1D5DB" : "#374151"} 
                            />
                          )}
                        </TouchableOpacity>
                        
                        {isOtherOption && showOtherInput[question.id] && (
                          <View style={styles.otherInputContainer}>
                            <View style={styles.arrowContainer}>
                              <Ionicons name="arrow-forward" size={16} color="#556B2F" style={styles.arrowIcon} />
                            </View>
                            <TextInput
                              style={[styles.otherTextInput, isDarkMode && styles.otherTextInputDark]}
                              placeholder={t('Type your answer')}
                              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                              value={otherInputs[question.id] || ''}
                              onChangeText={(text) => handleOtherInput(question.id, text)}
                            />
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      );
    } else {
      // CV Upload Page
      return (
        <View style={[styles.cvContainer, isDarkMode && styles.cvContainerDark]}>
          <Text style={[styles.questionText, isDarkMode && styles.questionTextDark]}>{t('Please enter your credentials and resume')}</Text>
          
          <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}>
            <Ionicons name="cloud-upload-outline" size={24} color="#10B981" />
            <Text style={styles.uploadButtonText}>{t('Upload CV/Resume')}</Text>
          </TouchableOpacity>

          {answers.cvFiles.length > 0 && (
            <View style={styles.filesContainer}>
              <Text style={[styles.filesTitle, isDarkMode && styles.filesTitleDark]}>{t('Uploaded Files:')}</Text>
              {answers.cvFiles.map((file, index) => (
                <View key={index} style={[styles.fileItem, isDarkMode && styles.fileItemDark]}>
                  <Ionicons name="document-outline" size={20} color="#6B7280" />
                  <Text style={[styles.fileName, isDarkMode && styles.fileNameDark]} numberOfLines={1}>{file.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveFile(index)}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.skipButton} onPress={handleSkipCV}>
            <Text style={[styles.skipButtonText, isDarkMode && styles.skipButtonTextDark]}>{t('Skip CV Upload')}</Text>
          </TouchableOpacity>
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
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingContent, isDarkMode && styles.loadingContentDark]}>
            <ActivityIndicator size="large" color="#556B2F" />
            <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>{t('Getting to know you...')}</Text>
          </View>
        </View>
      )}

      <View style={headerStyle}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFFFFF" : "#1F2937"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
          {currentPage === -1 ? t('AI Analysis') : currentPage < questions.length ? t('Questionnaire') : t('CV Upload')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <View style={progressContainerStyle}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={progressTextStyle}>{Math.round(progress)}% {t('Complete')}</Text>
      </View>

      <View style={styles.content}>
        {renderQuestion()}
      </View>

      {/* Move Next button above keyboard for dream job */}
      {currentPage < totalQuestions - 2 && questions[currentPage]?.id === 'dreamJob' ? (
        <View style={[styles.keyboardButtonContainer, navigationContainerStyle]}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentPage === -1 ? t('Start Questionnaire') : t('Next')}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={navigationContainerStyle}>
          {currentPage < totalQuestions - 2 ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentPage === -1 ? t('Start Questionnaire') : t('Next')}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
              <Text style={styles.finishButtonText}>{t('Finish Registration')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingContentDark: {
    backgroundColor: '#1F2937',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  loadingTextDark: {
    color: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerTitleDark: {
    color: '#F9FAFB',
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  progressContainerDark: {
    backgroundColor: '#1F2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#556B2F',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  progressTextDark: {
    color: '#D1D5DB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  questionScrollView: {
    flex: 1,
  },
  questionScrollContent: {
    flexGrow: 1,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionContainerDark: {
    backgroundColor: '#1F2937',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
    lineHeight: 28,
  },
  questionTextDark: {
    color: '#F9FAFB',
  },
  textInputContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textInputDark: {
    borderColor: '#374151',
    color: '#F9FAFB',
    backgroundColor: '#374151',
  },
  dreamJobInput: {
    height: 150, // Increased height for dream job
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  optionButtonDark: {
    borderColor: '#374151',
    backgroundColor: '#374151',
  },
  selectedOption: {
    borderColor: '#556B2F',
    backgroundColor: '#F0FDF4',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  optionTextDark: {
    color: '#D1D5DB',
  },
  selectedOptionText: {
    color: '#556B2F',
    fontWeight: '600',
  },
  otherInputContainer: {
    marginLeft: 20,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowContainer: {
    marginRight: 8,
    transform: [{ rotate: '90deg' }],
  },
  arrowIcon: {
    transform: [{ rotate: '90deg' }],
  },
  otherTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  otherTextInputDark: {
    borderColor: '#374151',
    color: '#F9FAFB',
    backgroundColor: '#374151',
  },
  cvContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cvContainerDark: {
    backgroundColor: '#1F2937',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#556B2F',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginVertical: 16,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#556B2F',
    fontWeight: '600',
  },
  filesContainer: {
    marginTop: 20,
  },
  filesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  filesTitleDark: {
    color: '#F9FAFB',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  fileItemDark: {
    backgroundColor: '#374151',
  },
  fileName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  fileNameDark: {
    color: '#D1D5DB',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  skipButtonTextDark: {
    color: '#9CA3AF',
  },
  navigationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navigationContainerDark: {
    backgroundColor: '#1F2937',
    borderTopColor: '#374151',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#556B2F',
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  finishButton: {
    backgroundColor: '#556B2F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  subOptionsContainer: {
    marginLeft: 20,
    marginTop: 8,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
  },
  subOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  subOptionButtonDark: {
    borderColor: '#374151',
    backgroundColor: '#374151',
  },
  selectedSubOption: {
    borderColor: '#556B2F',
    backgroundColor: '#F0FDF4',
  },
  subOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subOptionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  subOptionTextDark: {
    color: '#D1D5DB',
  },
  selectedSubOptionText: {
    color: '#556B2F',
    fontWeight: '600',
  },
  aiExplanationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiExplanationContainerDark: {
    backgroundColor: '#1F2937',
  },
  aiIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  aiTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  aiTitleDark: {
    color: '#F9FAFB',
  },
  aiDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  aiDescriptionDark: {
    color: '#D1D5DB',
  },
  aiFeaturesContainer: {
    marginTop: 20,
  },
  aiFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiFeatureText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  aiFeatureTextDark: {
    color: '#D1D5DB',
  },
  keyboardButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    zIndex: 1000, // Increased z-index to ensure it's above keyboard
  },
  keyboardButtonContainerDark: {
    backgroundColor: '#1F2937',
    borderTopColor: '#374151',
  },
});

export default QuestionnaireScreen;
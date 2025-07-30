import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDarkMode } from '../context/DarkModeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

const ProfileScreen = ({ navigation, onScreenChange }) => {
  const { userData, updateProfileImage } = useUser();
  const { t } = useLanguage();
  const [jobInterests, setJobInterests] = useState(['Technology/IT', 'Business/Finance']);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { isDarkMode } = useDarkMode();
  
  // Sample questionnaire answers (in real app, this would come from database)
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState({
    careerGoal: userData.careerGoal || '',
    region: userData.region || '',
    experience: userData.experience || '',
    field: userData.field || [],
    languages: userData.languages || [],
  });

  // Editable profile data - use actual user data from context
  const [profileData, setProfileData] = useState({
    fullName: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : 'User',
    email: userData.email || '',
    phone: userData.phone || '',
    location: userData.location || '',
    university: userData.university || '',
    degree: userData.degree || '',
  });

  // Update profile data when userData changes
  useEffect(() => {
    setProfileData(prev => ({
      ...prev,
      fullName: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : 'User',
      email: userData.email || prev.email,
      phone: userData.phone || prev.phone,
      location: userData.location || prev.location,
      university: userData.university || prev.university,
      degree: userData.degree || prev.degree,
    }));
    
    // Update questionnaire answers from user data
    setQuestionnaireAnswers({
      careerGoal: userData.careerGoal || '',
      region: userData.region || '',
      experience: userData.experience || '',
      field: userData.field || [],
      languages: userData.languages || [],
    });
  }, [userData, t]);

  const [editData, setEditData] = useState({});

  // Get user's first initial for avatar fallback
  const getUserInitial = () => {
    if (profileData.fullName && profileData.fullName !== 'User') {
      return profileData.fullName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Handle profile image picker
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t('Error'), t('Failed to pick image. Please try again.'));
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('Logout'),
      t('Are you sure you want to logout?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { 
          text: t('Logout'), 
          onPress: () => {
            // Navigate back to Welcome screen after logout
            navigation.navigate('Welcome');
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    setEditData({ ...profileData });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    setProfileData(editData);
    setShowEditModal(false);
    Alert.alert(t('Success'), t('Profile updated successfully!'));
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
  };

  const handleRefreshSuggestions = () => {
    Alert.alert(t('Success'), t('AI suggestions refreshed!'));
  };

  const handleRetakeQuestionnaire = () => {
    navigation.navigate('Questionnaire');
  };

  const handleMenuPress = () => {
    // Navigate back to Home
    if (onScreenChange) {
      onScreenChange('Home');
    }
  };

  const toggleJobInterest = (interest) => {
    if (jobInterests.includes(interest)) {
      setJobInterests(jobInterests.filter(item => item !== interest));
    } else {
      setJobInterests([...jobInterests, interest]);
    }
  };

  const containerStyle = isDarkMode ? styles.containerDark : styles.container;
  const cardStyle = isDarkMode ? styles.cardDark : styles.card;
  const textStyle = isDarkMode ? styles.textDark : styles.text;
  const titleStyle = isDarkMode ? styles.titleDark : styles.title;

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFFFFF" : "#1F2937"} />
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              {userData.profileImage ? (
                <Image source={{ uri: userData.profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getUserInitial()}</Text>
                </View>
              )}
              <View style={styles.editImageButton}>
                <Ionicons name="camera" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.username, titleStyle]}>{profileData.fullName}</Text>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, titleStyle]}>{t('Your Profile')}</Text>
              <Text style={[styles.sectionSubtitle, textStyle]}>{t('Manage your information and preferences.')}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#6B7280" />
              <Text style={styles.logoutText}>{t('Logout')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Details */}
        <View style={[styles.card, cardStyle]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, titleStyle]}>{t('Personal Details')}</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Ionicons name="pencil-outline" size={16} color="#6B7280" />
              <Text style={styles.editText}>{t('Edit')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, textStyle]}>{t('Full Name')}</Text>
              <Text style={[styles.detailValue, titleStyle]}>{profileData.fullName}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, textStyle]}>{t('Email')}</Text>
              <Text style={[styles.detailValue, titleStyle]}>
                {profileData.email || t('Not specified')}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, textStyle]}>{t('Phone')}</Text>
              <Text style={[styles.detailValue, titleStyle]}>
                {profileData.phone || t('Not specified')}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, textStyle]}>{t('Location')}</Text>
              <Text style={[styles.detailValue, titleStyle]}>
                {profileData.location || t('Not specified')}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, textStyle]}>{t('University')}</Text>
              <Text style={[styles.detailValue, titleStyle]}>
                {profileData.university || t('Not specified')}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, textStyle]}>{t('Degree')}</Text>
              <Text style={[styles.detailValue, titleStyle]}>
                {profileData.degree || t('Not specified')}
              </Text>
            </View>
          </View>



          {/* Job Interests */}
          <View style={styles.jobInterestsSection}>
            <Text style={[styles.detailLabel, textStyle]}>{t('Job Interests')}</Text>
            <View style={styles.interestTags}>
              <TouchableOpacity 
                style={[styles.interestTag, styles.interestTagActive]}
                onPress={() => toggleJobInterest('Technology/IT')}
              >
                <Text style={styles.interestTagTextActive}>{t('Technology/IT')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.interestTag, styles.interestTagActive]}
                onPress={() => toggleJobInterest('Business/Finance')}
              >
                <Text style={styles.interestTagTextActive}>{t('Business/Finance')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Questionnaire Answers */}
        <View style={[styles.card, cardStyle]}>
          <Text style={[styles.cardTitle, titleStyle]}>{t('Questionnaire Answers')}</Text>
          <Text style={[styles.cardDescription, textStyle]}>
            {t('Your responses from the registration questionnaire.')}
          </Text>

          <View style={styles.questionnaireSection}>
            <View style={styles.questionItem}>
              <Text style={[styles.questionLabel, titleStyle]}>{t('Career Goal')}</Text>
              <Text style={[styles.questionAnswer, textStyle]}>
                {questionnaireAnswers.careerGoal || t('Not specified')}
              </Text>
            </View>
            
            <View style={styles.questionItem}>
              <Text style={[styles.questionLabel, titleStyle]}>{t('Region')}</Text>
              <Text style={[styles.questionAnswer, textStyle]}>
                {questionnaireAnswers.region || t('Not specified')}
              </Text>
            </View>
            
            <View style={styles.questionItem}>
              <Text style={[styles.questionLabel, titleStyle]}>{t('Experience Level')}</Text>
              <Text style={[styles.questionAnswer, textStyle]}>
                {questionnaireAnswers.experience || t('Not specified')}
              </Text>
            </View>
            
            <View style={styles.questionItem}>
              <Text style={[styles.questionLabel, titleStyle]}>{t('Field of Experience')}</Text>
              <View style={styles.answerTags}>
                {questionnaireAnswers.field && questionnaireAnswers.field.length > 0 ? (
                  questionnaireAnswers.field.map((field, index) => (
                    <View key={index} style={styles.answerTag}>
                      <Text style={styles.answerTagText}>{field}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.questionAnswer, textStyle]}>{t('Not specified')}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.questionItem}>
              <Text style={[styles.questionLabel, titleStyle]}>{t('Languages')}</Text>
              <View style={styles.answerTags}>
                {questionnaireAnswers.languages && questionnaireAnswers.languages.length > 0 ? (
                  questionnaireAnswers.languages.map((language, index) => (
                    <View key={index} style={styles.answerTag}>
                      <Text style={styles.answerTagText}>{language}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.questionAnswer, textStyle]}>{t('Not specified')}</Text>
                )}
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.retakeButton} onPress={handleRetakeQuestionnaire}>
            <Text style={[styles.retakeButtonText, titleStyle]}>{t('Retake Questionnaire')}</Text>
          </TouchableOpacity>
        </View>

        {/* AI Analyst Section */}
        <View style={[styles.card, cardStyle]}>
          <Text style={[styles.cardTitle, titleStyle]}>{t('AI Analyst')}</Text>
          <Text style={[styles.cardDescription, textStyle]}>
            {t('Retake the survey or refresh your recommendations based on your latest profile updates.')}
          </Text>

          <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshSuggestions}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.refreshButtonText}>{t('Refresh AI Suggestions')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, isDarkMode && styles.modalContainerDark]}>
          <View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}>
            <Text style={[styles.modalTitle, titleStyle]}>{t('Edit Profile')}</Text>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Ionicons name="close" size={24} color={isDarkMode ? "#FFFFFF" : "#1F2937"} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, textStyle]}>{t('Full Name')}</Text>
              <TextInput
                style={[styles.textInput, isDarkMode && styles.textInputDark]}
                value={editData.fullName}
                onChangeText={(text) => setEditData({...editData, fullName: text})}
                placeholder={t('Enter your full name')}
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, textStyle]}>{t('Email')}</Text>
              <TextInput
                style={[styles.textInput, isDarkMode && styles.textInputDark]}
                value={editData.email}
                onChangeText={(text) => setEditData({...editData, email: text})}
                placeholder={t('Enter your email')}
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, textStyle]}>{t('Phone')}</Text>
              <TextInput
                style={[styles.textInput, isDarkMode && styles.textInputDark]}
                value={editData.phone}
                onChangeText={(text) => setEditData({...editData, phone: text})}
                placeholder={t('Enter your phone number')}
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, textStyle]}>{t('Location')}</Text>
              <TextInput
                style={[styles.textInput, isDarkMode && styles.textInputDark]}
                value={editData.location}
                onChangeText={(text) => setEditData({...editData, location: text})}
                placeholder={t('Enter your location')}
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, textStyle]}>{t('University')}</Text>
              <TextInput
                style={[styles.textInput, isDarkMode && styles.textInputDark]}
                value={editData.university}
                onChangeText={(text) => setEditData({...editData, university: text})}
                placeholder={t('Enter your university')}
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, textStyle]}>{t('Degree')}</Text>
              <TextInput
                style={[styles.textInput, isDarkMode && styles.textInputDark]}
                value={editData.degree}
                onChangeText={(text) => setEditData({...editData, degree: text})}
                placeholder={t('Enter your degree')}
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
              />
            </View>
            

          </ScrollView>
          
          <View style={[styles.modalFooter, isDarkMode && styles.modalFooterDark]}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.saveButtonText}>{t('Save Changes')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 3,
    borderColor: '#10B981',
  },
  avatar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  titleDark: {
    color: '#F9FAFB',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  textDark: {
    color: '#D1D5DB',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logoutText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1F2937',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    width: '50%',
    marginBottom: 16,
    paddingRight: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },

  jobInterestsSection: {
    marginTop: 4,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  interestTagActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  interestTagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  interestTagTextActive: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  questionnaireSection: {
    marginBottom: 20,
  },
  questionItem: {
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  questionAnswer: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  answerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  answerTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  answerTagText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  retakeButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 16,
  },
  retakeButtonText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalContainerDark: {
    backgroundColor: '#111827',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalHeaderDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
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
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalFooterDark: {
    backgroundColor: '#1F2937',
    borderTopColor: '#374151',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProfileScreen;
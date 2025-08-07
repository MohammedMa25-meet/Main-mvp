import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../context/DarkModeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const CareerTrackerScreen = ({ navigation, onScreenChange }) => {
  const { isDarkMode } = useDarkMode();
  const { t } = useLanguage();
  const { userData, updateUserData } = useUser();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Progress View');
  const [careerGoals, setCareerGoals] = useState([]);
  const [progressData, setProgressData] = useState({
    coursesCompleted: 0,
    jobsApplied: 0,
    skillsAcquired: 0,
    interviewPrep: 0,
  });

  const containerStyle = isDarkMode ? styles.containerDark : styles.container;
  const titleStyle = isDarkMode ? styles.titleDark : styles.title;
  const textStyle = isDarkMode ? styles.textDark : styles.text;
  const cardStyle = isDarkMode ? styles.cardDark : styles.card;

  useEffect(() => {
    loadCareerData();
  }, []);

  const loadCareerData = async () => {
    try {
      if (userData?.uid) {
        const userDocRef = doc(db, 'users', userData.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          
          // Load existing progress or initialize to zero
          setProgressData({
            coursesCompleted: data.careerProgress?.coursesCompleted || 0,
            jobsApplied: data.careerProgress?.jobsApplied || 0,
            skillsAcquired: data.careerProgress?.skillsAcquired || 0,
            interviewPrep: data.careerProgress?.interviewPrep || 0,
          });

          // Load existing goals or generate new ones
          if (data.careerGoals && data.careerGoals.length > 0) {
            setCareerGoals(data.careerGoals);
          } else {
            await generateCareerGoals();
          }
        } else {
          await generateCareerGoals();
        }
      }
    } catch (error) {
      console.error('Error loading career data:', error);
      Alert.alert(t('Error'), t('Failed to load career data'));
    } finally {
      setIsLoading(false);
    }
  };

  const generateCareerGoals = async () => {
    try {
      // Generate AI-based goals based on questionnaire answers
      const goals = generateGoalsFromQuestionnaire(userData);
      setCareerGoals(goals);

      // Save to database
      if (userData?.uid) {
        const userDocRef = doc(db, 'users', userData.uid);
        await updateDoc(userDocRef, {
          careerGoals: goals,
          careerProgress: progressData,
          lastCareerUpdate: new Date(),
        });
      }
    } catch (error) {
      console.error('Error generating career goals:', error);
    }
  };

  const generateGoalsFromQuestionnaire = (userData) => {
    const goals = [];
    const currentDate = new Date();
    
    // Base goals based on career interests
    if (userData?.desiredField?.includes('IT- ICT') || userData?.desiredField?.includes('Software Development')) {
      goals.push({
        id: 'goal_1',
        title: 'Complete "Introduction to Web Development" course',
        targetDate: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: 'IN_PROGRESS',
        category: 'Learning',
        icon: 'book-outline',
        color: '#11523d',
      });
      
      goals.push({
        id: 'goal_2',
        title: 'Apply to 3 Frontend Developer positions',
        targetDate: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days
        status: 'PENDING',
        category: 'Job Search',
        icon: 'briefcase-outline',
        color: '#bb9704',
      });
    }

    if (userData?.desiredField?.includes('AI Consulting')) {
      goals.push({
        id: 'goal_3',
        title: 'Learn Python basics for AI',
        targetDate: new Date(currentDate.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days
        status: 'PENDING',
        category: 'Learning',
        icon: 'code-outline',
        color: '#11523d',
      });
    }

    // Language proficiency goals
    if (userData?.languageProficiency?.includes('English')) {
      goals.push({
        id: 'goal_4',
        title: 'Practice English interview skills',
        targetDate: new Date(currentDate.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days
        status: 'PENDING',
        category: 'Skills',
        icon: 'chatbubble-outline',
        color: '#bb9704',
      });
    }

    // General career development goals
    goals.push({
      id: 'goal_5',
      title: 'Update CV with latest skills',
      targetDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'PENDING',
      category: 'Career',
      icon: 'document-outline',
      color: '#11523d',
    });

    return goals;
  };

  const updateGoalStatus = async (goalId, newStatus) => {
    try {
      const updatedGoals = careerGoals.map(goal => 
        goal.id === goalId ? { ...goal, status: newStatus } : goal
      );
      setCareerGoals(updatedGoals);

      // Update progress based on completed goals
      const completedGoals = updatedGoals.filter(goal => goal.status === 'DONE');
      const newProgress = {
        coursesCompleted: completedGoals.filter(goal => goal.category === 'Learning').length,
        jobsApplied: completedGoals.filter(goal => goal.category === 'Job Search').length,
        skillsAcquired: completedGoals.filter(goal => goal.category === 'Skills').length,
        interviewPrep: completedGoals.filter(goal => goal.category === 'Interview').length,
      };
      setProgressData(newProgress);

      // Save to database
      if (userData?.uid) {
        const userDocRef = doc(db, 'users', userData.uid);
        await updateDoc(userDocRef, {
          careerGoals: updatedGoals,
          careerProgress: newProgress,
          lastCareerUpdate: new Date(),
        });
      }
    } catch (error) {
      console.error('Error updating goal status:', error);
      Alert.alert(t('Error'), t('Failed to update goal status'));
    }
  };

  const handleMenuPress = () => setShowSidebar(!showSidebar);
  const handleProfilePress = () => { setShowSidebar(false); if (onScreenChange) onScreenChange('Profile'); };
  const handleSettingsPress = () => { setShowSidebar(false); if (onScreenChange) onScreenChange('Settings'); };
  const handleHomePress = () => { setShowSidebar(false); if (onScreenChange) onScreenChange('Home'); };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DONE': return '#10B981';
      case 'IN_PROGRESS': return '#F59E0B';
      case 'PENDING': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'DONE': return t('DONE');
      case 'IN_PROGRESS': return t('IN_PROGRESS');
      case 'PENDING': return t('PENDING');
      default: return t('PENDING');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={containerStyle}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? "#FFFFFF" : "#065F46"} />
          <Text style={textStyle}>{t('Loading Career Tracker...')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      {showSidebar && (
        <View style={[styles.sidebar, isDarkMode && styles.sidebarDark]}>
          <View style={styles.sidebarHeader}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>
                  {userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : 'B'}
                </Text>
              </View>
              <Text style={[styles.logoTitle, titleStyle]}>BridgeIT</Text>
            </View>
          </View>
          <View style={styles.sidebarMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleHomePress}>
              <Ionicons name="home" size={20} color="#6B7280" />
              <Text style={[styles.menuText, textStyle]}>{t('Home')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.activeMenuItem]}>
              <Ionicons name="trending-up" size={20} color="#065F46" />
              <Text style={[styles.menuText, titleStyle]}>{t('Career Tracker')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleProfilePress}>
              <Ionicons name="person" size={20} color="#6B7280" />
              <Text style={[styles.menuText, textStyle]}>{t('Profile')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleSettingsPress}>
              <Ionicons name="settings-outline" size={20} color="#6B7280" />
              <Text style={[styles.menuText, textStyle]}>{t('Settings')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.mainContent}>
        {showSidebar && (
          <TouchableOpacity 
            style={styles.sidebarOverlay} 
            activeOpacity={1} 
            onPress={() => setShowSidebar(false)} 
          />
        )}
        
        {/* Header */}
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <TouchableOpacity onPress={handleMenuPress}>
            <Ionicons name="menu" size={24} color={isDarkMode ? "#FFFFFF" : "#1f2937"} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>
                {userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : 'B'}
              </Text>
            </View>
            <Text style={[styles.logoTitle, titleStyle]}>BridgeIT</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Main Title */}
          <Text style={[styles.mainTitle, titleStyle]}>{t('Your Personalized Career Plan')}</Text>

          {/* Career Progress Tracker Card */}
          <View style={[styles.trackerCard, cardStyle]}>
            <View style={styles.trackerHeader}>
              <Ionicons name="rocket" size={24} color="#bb9704" />
              <Text style={[styles.trackerTitle, titleStyle]}>{t('Career Progress Tracker')}</Text>
            </View>
            <Text style={[styles.trackerSubtitle, textStyle]}>
              {t('Your roadmap to success. Visualize milestones and track your journey.')}
            </Text>
            
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'Progress View' ? styles.activeTab : styles.inactiveTab]} 
                onPress={() => setActiveTab('Progress View')}
              >
                <Ionicons name="checkmark-circle" size={20} color={activeTab === 'Progress View' ? "#1f2937" : "#9ca3af"} />
                <Text style={[styles.tabText, activeTab === 'Progress View' ? styles.activeTabText : styles.inactiveTabText]}>
                  {t('Progress View')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'Career Calendar' ? styles.activeTab : styles.inactiveTab]} 
                onPress={() => setActiveTab('Career Calendar')}
              >
                <Ionicons name="calendar-outline" size={20} color={activeTab === 'Career Calendar' ? "#1f2937" : "#9ca3af"} />
                <Text style={[styles.tabText, activeTab === 'Career Calendar' ? styles.activeTabText : styles.inactiveTabText]}>
                  {t('Career Calendar')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Overview */}
          <Text style={[styles.sectionTitle, titleStyle]}>{t('Progress Overview')}</Text>
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressItem, cardStyle]}>
              <View style={styles.progressHeader}>
                <Ionicons name="book-outline" size={20} color="#11523d" />
                <Text style={[styles.progressLabel, titleStyle]}>{t('Courses Completed')}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(progressData.coursesCompleted / 1) * 100}%`, backgroundColor: '#10B981' }]} />
              </View>
              <Text style={styles.progressText}>{progressData.coursesCompleted}/1</Text>
            </View>

            <View style={[styles.progressItem, cardStyle]}>
              <View style={styles.progressHeader}>
                <Ionicons name="briefcase-outline" size={20} color="#bb9704" />
                <Text style={[styles.progressLabel, titleStyle]}>{t('Jobs Applied')}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(progressData.jobsApplied / 2) * 100}%`, backgroundColor: '#F59E0B' }]} />
              </View>
              <Text style={styles.progressText}>{progressData.jobsApplied}/2</Text>
            </View>

            <View style={[styles.progressItem, cardStyle]}>
              <View style={styles.progressHeader}>
                <Ionicons name="person-outline" size={20} color="#11523d" />
                <Text style={[styles.progressLabel, titleStyle]}>{t('Skills Acquired')}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(progressData.skillsAcquired / 1) * 100}%`, backgroundColor: '#10B981' }]} />
              </View>
              <Text style={styles.progressText}>{progressData.skillsAcquired}/1</Text>
            </View>

            <View style={[styles.progressItem, cardStyle]}>
              <View style={styles.progressHeader}>
                <Ionicons name="chatbubble-outline" size={20} color="#11523d" />
                <Text style={[styles.progressLabel, titleStyle]}>{t('Interview Prep')}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(progressData.interviewPrep / 2) * 100}%`, backgroundColor: '#11523d' }]} />
              </View>
              <Text style={styles.progressText}>{progressData.interviewPrep}/2</Text>
            </View>
          </View>

          {/* Your Goals */}
          <Text style={[styles.sectionTitle, titleStyle]}>{t('Your Goals')}</Text>
          
          <View style={styles.goalsContainer}>
            {careerGoals.map((goal) => (
              <View key={goal.id} style={[styles.goalCard, cardStyle]}>
                <View style={styles.goalHeader}>
                  <View style={[styles.goalIcon, { backgroundColor: goal.color }]}>
                    <Ionicons name={goal.icon} size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalTitle, titleStyle]}>{goal.title}</Text>
                    <Text style={[styles.goalDate, textStyle]}>
                      {t('Target')}: {formatDate(goal.targetDate)}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.statusButton, { backgroundColor: getStatusColor(goal.status) }]}
                    onPress={() => {
                      const newStatus = goal.status === 'DONE' ? 'PENDING' : 
                                      goal.status === 'PENDING' ? 'IN_PROGRESS' : 'DONE';
                      updateGoalStatus(goal.id, newStatus);
                    }}
                  >
                    <Text style={styles.statusText}>{getStatusText(goal.status)}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#ffffff',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sidebarDark: {
    backgroundColor: '#374151',
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  sidebarHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sidebarMenu: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeMenuItem: {
    backgroundColor: '#f3f4f6',
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDark: {
    backgroundColor: '#374151',
    borderBottomColor: '#4b5563',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#065F46',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  titleDark: {
    color: '#ffffff',
  },
  textDark: {
    color: '#d1d5db',
  },
  cardDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#1f2937',
  },
  trackerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  trackerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1f2937',
  },
  trackerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#1f2937',
  },
  inactiveTabText: {
    color: '#9ca3af',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 16,
    color: '#1f2937',
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  progressItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1f2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
  },
  goalsContainer: {
    marginHorizontal: 20,
  },
  goalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  goalDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default CareerTrackerScreen; 
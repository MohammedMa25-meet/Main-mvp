import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import JobDetailModal from '../components/JobDetailModal';
import CourseDetailModal from '../components/CourseDetailModal';
import { useDarkMode } from '../context/DarkModeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchCourses } from '../services/courseService';

const HomepageScreen = ({ navigation, onScreenChange }) => {
  const { userData, clearUserData } = useUser();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Courses');
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [shuffledJobs, setShuffledJobs] = useState([]);

  // State for live data
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sample job data remains the same
  const jobs = useMemo(() => [
    {
      id: 1,
      title: t('Network Security Specialist'),
      company: 'CyberGuard WB',
      location: 'Nablus',
      workType: t('On-site'),
      level: t('Mid Level'),
      salary: '$1500k - $2200k',
      category: t('Cybersecurity'),
      description: t('Protect our clients\' digital infrastructure and implement advanced security measures to safeguard against cyber threats.'),
      suitabilityReason: t('Your cybersecurity background and technical skills align perfectly with this role. The company values candidates with your experience level.'),
      matchingSkills: [t('Network Security'), t('Cybersecurity'), t('Problem-solving')],
      requirements: [
        t('Bachelor\'s degree in Computer Science or related field'),
        t('Experience with network security protocols'),
        t('Knowledge of cybersecurity tools and practices'),
        t('Strong analytical and problem-solving skills')
      ]
    },
    {
      id: 2,
      title: t('Cybersecurity Analyst'),
      company: 'Qatar Cyber Defense',
      location: 'Doha, Qatar',
      workType: t('On-site'),
      level: t('Senior Level'),
      salary: '$4000k - $6000k',
      category: t('Cybersecurity'),
      description: t('Protect our clients\' digital infrastructure and implement advanced security measures to safeguard against cyber threats.'),
      suitabilityReason: t('Your background in cybersecurity and analytical skills make you an ideal candidate for this position.'),
      matchingSkills: [t('Cybersecurity'), t('Threat Analysis'), t('Security Tools')],
      requirements: [
        t('Master\'s degree in Cybersecurity or related field'),
        t('Experience with threat detection and response'),
        t('Knowledge of security frameworks and compliance'),
        t('Excellent communication and reporting skills')
      ]
    },
    {
      id: 3,
      title: t('Data Scientist'),
      company: 'Saudi Analytics Hub',
      location: 'Riyadh, Saudi Arabia',
      workType: t('Remote'),
      level: t('Senior Level'),
      salary: '$3500k - $5500k',
      category: t('Data Science'),
      description: t('Analyze business data and create predictive models to drive strategic decisions and improve operational efficiency.'),
      suitabilityReason: t('Your data analysis skills and technical background make you a perfect fit for this role.'),
      matchingSkills: [t('Data Analysis'), t('Machine Learning'), t('Python')],
      requirements: [
        t('Master\'s degree in Data Science or related field'),
        t('Experience with machine learning algorithms'),
        t('Proficiency in Python, R, and SQL'),
        t('Strong statistical analysis skills')
      ]
    },
    {
      id: 4,
      title: t('Data Analyst'),
      company: 'DataInsights Palestine',
      location: 'Bethlehem',
      workType: t('Remote'),
      level: t('Entry Level'),
      salary: '$1000k - $1600k',
      category: t('Data Science'),
      description: t('Analyze business data and create insights to help organizations make data-driven decisions.'),
      suitabilityReason: t('Your analytical skills and attention to detail make you an excellent candidate for this position.'),
      matchingSkills: [t('Data Analysis'), t('Excel'), t('SQL')],
      requirements: [
        t('Bachelor\'s degree in Statistics, Mathematics, or related field'),
        t('Experience with data visualization tools'),
        t('Proficiency in Excel and SQL'),
        t('Strong analytical and problem-solving skills')
      ]
    }
  ], [t]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const searchKeywords = userData?.field?.join(' ') || 'software development';
      const fetchedCourses = await fetchCourses(searchKeywords);
      setCourses(fetchedCourses);
      setIsLoading(false);
    };

    loadInitialData();
  }, [userData]);

  useEffect(() => {
    setShuffledJobs([...jobs].sort(() => Math.random() - 0.5));
  }, [jobs]);

  const handleMenuPress = () => setShowSidebar(!showSidebar);
  const handleJobPress = (job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };
  const handleCoursePress = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };
  const handleProfilePress = () => {
    setShowSidebar(false);
    if (onScreenChange) onScreenChange('Profile');
  };
  const handleSettingsPress = () => {
    setShowSidebar(false);
    if (onScreenChange) onScreenChange('Settings');
  };
  const handleLogout = () => {
    setShowSidebar(false);
    clearUserData();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const handleRefreshSuggestions = async () => {
    setIsLoading(true);
    const searchKeywords = userData?.field?.join(' ') || 'data science';
    const fetchedCourses = await fetchCourses(searchKeywords);
    setCourses(fetchedCourses);
    setShuffledJobs([...jobs].sort(() => Math.random() - 0.5));
    setIsLoading(false);
    Alert.alert(t('Success'), t('Suggestions have been refreshed!'));
  };

  const { isDarkMode } = useDarkMode();
  const containerStyle = isDarkMode ? styles.containerDark : styles.container;
  const cardStyle = isDarkMode ? styles.cardDark : styles.card;
  const textStyle = isDarkMode ? styles.textDark : styles.text;
  const titleStyle = isDarkMode ? styles.titleDark : styles.title;

  return (
    <SafeAreaView style={containerStyle}>
      {/* Sidebar */}
      {showSidebar && (
        <View style={[styles.sidebar, isDarkMode && styles.sidebarDark]}>
          <View style={styles.sidebarHeader}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}><Text style={styles.logoText}>{userData.firstName ? userData.firstName.charAt(0).toUpperCase() : 'B'}</Text></View>
              <Text style={[styles.logoTitle, titleStyle]}>BridgeIT</Text>
            </View>
          </View>
          <View style={styles.sidebarMenu}>
            <TouchableOpacity style={[styles.menuItem, styles.activeMenuItem]}><Ionicons name="home" size={20} color="#065F46" /><Text style={[styles.menuText, titleStyle]}>{t('Home')}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleProfilePress}><Ionicons name="person" size={20} color="#6B7280" /><Text style={[styles.menuText, textStyle]}>{t('Profile')}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleSettingsPress}><Ionicons name="settings-outline" size={20} color="#6B7280" /><Text style={[styles.menuText, textStyle]}>{t('Settings')}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}><Ionicons name="log-out-outline" size={20} color="#EF4444" /><Text style={[styles.menuText, { color: '#EF4444' }]}>{t('Logout')}</Text></TouchableOpacity>
          </View>
          <View style={styles.sidebarFooter}>
            <View style={styles.userInfo}>
              {userData.profileImage ? <Image source={{ uri: userData.profileImage }} style={styles.userAvatar} /> : <View style={styles.userAvatarPlaceholder}><Text style={styles.userAvatarText}>{userData.firstName ? userData.firstName.charAt(0).toUpperCase() : 'U'}</Text></View>}
              <View>
                <Text style={[styles.userName, titleStyle]}>{userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.specialization || 'ICT Graduate'}</Text>
                <Text style={[styles.userLocation, textStyle]}>{userData.region || 'West Bank'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.mainContent}>
        {showSidebar && <TouchableOpacity style={styles.sidebarOverlay} activeOpacity={1} onPress={() => setShowSidebar(false)} />}
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <TouchableOpacity onPress={handleMenuPress}><Ionicons name="menu" size={24} color={isDarkMode ? "#FFFFFF" : "#1f2937"} /></TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}><Text style={styles.logoText}>{userData.firstName ? userData.firstName.charAt(0).toUpperCase() : 'B'}</Text></View>
            <Text style={[styles.logoTitle, titleStyle]}>BridgeIT</Text>
          </View>
          <TouchableOpacity onPress={handleRefreshSuggestions}><Ionicons name="refresh" size={24} color={isDarkMode ? "#FFFFFF" : "#1f2937"} /></TouchableOpacity>
        </View>
        <View style={styles.welcomeSection}><Text style={[styles.welcomeSubtitle, textStyle]}>{t('Your career hub is ready.')}</Text></View>
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === 'Jobs' ? styles.activeTab : styles.inactiveTab]} onPress={() => setActiveTab('Jobs')}><Ionicons name="briefcase-outline" size={20} color={activeTab === 'Jobs' ? "#1f2937" : "#9ca3af"} /><Text style={[styles.tabText, activeTab === 'Jobs' ? styles.activeTabText : styles.inactiveTabText]}>{t('Jobs')}</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'Courses' ? styles.activeTab : styles.inactiveTab]} onPress={() => setActiveTab('Courses')}><Ionicons name="book-outline" size={20} color={activeTab === 'Courses' ? "#1f2937" : "#9ca3af"} /><Text style={[styles.tabText, activeTab === 'Courses' ? styles.activeTabText : styles.inactiveTabText]}>{t('Courses')}</Text></TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={isDarkMode ? "#FFFFFF" : "#065F46"} />
              <Text style={textStyle}>Fetching Live Recommendations...</Text>
            </View>
          ) : activeTab === 'Jobs' ? (
            <View>
              {shuffledJobs.map((job) => (
                <TouchableOpacity key={job.id} style={[styles.jobCard, cardStyle]} onPress={() => handleJobPress(job)}>
                  <View style={styles.jobHeader}>
                    <View style={styles.categoryTag}><Text style={styles.categoryText}>{job.category}</Text></View>
                    <View style={styles.jobIcon}><View style={styles.iconContainer}><View style={styles.iconBar1} /><View style={styles.iconBar2} /><View style={styles.iconBar3} /></View></View>
                  </View>
                  <Text style={[styles.jobTitle, titleStyle]}>{job.title}</Text>
                  <Text style={[styles.companyName, textStyle]}>{job.company}</Text>
                  <View style={styles.jobDetails}>
                    <View style={styles.jobDetailItem}><Ionicons name="location-outline" size={16} color="#6b7280" /><Text style={styles.jobDetailText}>{job.location}</Text></View>
                    <View style={styles.jobDetailItem}><Ionicons name="business-outline" size={16} color="#6b7280" /><Text style={styles.jobDetailText}>{job.workType}</Text></View>
                  </View>
                  <View style={styles.salaryContainer}><Ionicons name="cash-outline" size={16} color="#6b7280" /><Text style={styles.salaryText}>{job.salary}</Text></View>
                  <Text style={[styles.jobDescription, textStyle]}>{job.description}</Text>
                  <TouchableOpacity style={styles.viewDetailsButton} onPress={() => handleJobPress(job)}><Text style={styles.viewDetailsText}>{t('View Details')}</Text><Ionicons name="arrow-forward" size={16} color="#ffffff" /></TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View>
              {courses.map((course) => (
                <TouchableOpacity key={course.id} style={[styles.courseCard, cardStyle]} onPress={() => handleCoursePress(course)}>
                  <Image source={{ uri: course.image }} style={styles.courseImage} />
                  <View style={styles.courseCategoryTag}><Text style={styles.courseCategoryText}>{course.level || 'General'}</Text></View>
                  <Text style={[styles.courseTitle, titleStyle]}>{course.title}</Text>
                  <Text style={[styles.courseProvider, textStyle]}>{course.provider}</Text>
                  <View style={styles.courseDetails}>
                    {course.duration && <View style={styles.courseDetailItem}><Ionicons name="time-outline" size={16} color="#6b7280" /><Text style={styles.courseDetailText}>{course.duration}</Text></View>}
                    <View style={styles.courseDetailItem}><Ionicons name="globe-outline" size={16} color="#6b7280" /><Text style={styles.courseDetailText}>Online</Text></View>
                  </View>
                  <Text style={[styles.courseDescription, textStyle]}>{course.description}</Text>
                  <TouchableOpacity style={styles.viewDetailsButton} onPress={() => handleCoursePress(course)}><Text style={styles.viewDetailsText}>{t('View Details')}</Text><Ionicons name="arrow-forward" size={16} color="#ffffff" /></TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Modals */}
      <JobDetailModal visible={showJobModal} job={selectedJob} onClose={() => setShowJobModal(false)} />
      <CourseDetailModal visible={showCourseModal} course={selectedCourse} onClose={() => setShowCourseModal(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  container: { flex: 1, backgroundColor: '#f8fafc' },
  containerDark: { flex: 1, backgroundColor: '#111827' },
  sidebar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 280, backgroundColor: '#FFFFFF', zIndex: 1000, shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  sidebarDark: { backgroundColor: '#1F2937' },
  sidebarOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999 },
  sidebarHeader: { paddingHorizontal: 20, paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logoCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#065F46', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  logoText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  logoTitle: { fontSize: 20, fontWeight: '700', color: '#065F46' },
  sidebarMenu: { paddingVertical: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, marginBottom: 4 },
  activeMenuItem: { backgroundColor: '#F0FDF4', borderTopRightRadius: 20, borderBottomRightRadius: 20, borderLeftWidth: 4, borderLeftColor: '#10B981' },
  menuText: { fontSize: 16, color: '#6B7280', marginLeft: 12 },
  sidebarFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginLeft: 8 },
  userLocation: { fontSize: 12, color: '#6B7280', marginLeft: 8 },
  userAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  userAvatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#065F46', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  userAvatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  mainContent: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  headerDark: { backgroundColor: '#1F2937' },
  headerLeft: { marginRight: 16 },
  welcomeSection: { paddingHorizontal: 20, paddingVertical: 24 },
  welcomeSubtitle: { fontSize: 16, color: '#6b7280', fontWeight: '400' },
  textDark: { color: '#D1D5DB' },
  tabContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 24 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginHorizontal: 4 },
  activeTab: { backgroundColor: '#ffffff', shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  inactiveTab: { backgroundColor: 'transparent' },
  tabText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  activeTabText: { color: '#1f2937' },
  inactiveTabText: { color: '#9ca3af' },
  content: { paddingHorizontal: 20, },
  jobCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardDark: { backgroundColor: '#1F2937' },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  categoryTag: { backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  categoryText: { color: '#1d4ed8', fontSize: 12, fontWeight: '600' },
  jobIcon: { width: 40, height: 40, backgroundColor: '#f3f4f6', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  iconContainer: { flexDirection: 'row', alignItems: 'flex-end' },
  iconBar1: { width: 3, height: 8, backgroundColor: '#3b82f6', marginRight: 2 },
  iconBar2: { width: 3, height: 12, backgroundColor: '#10b981', marginRight: 2 },
  iconBar3: { width: 3, height: 6, backgroundColor: '#f59e0b' },
  jobTitle: { fontSize: 20, fontWeight: '700', color: '#065f46', marginBottom: 4 },
  titleDark: { color: '#10B981' },
  title: { color: '#065f46' },
  companyName: { fontSize: 16, color: '#6b7280', marginBottom: 12 },
  text: { color: '#374151' },
  jobDetails: { flexDirection: 'row', marginBottom: 8 },
  jobDetailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  jobDetailText: { fontSize: 14, color: '#6b7280', marginLeft: 4 },
  salaryContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  salaryText: { fontSize: 14, color: '#6b7280', marginLeft: 4 },
  jobDescription: { fontSize: 14, color: '#4b5563', lineHeight: 20, marginBottom: 16 },
  viewDetailsButton: { backgroundColor: '#065f46', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
  viewDetailsText: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginRight: 8 },
  courseCard: { backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  courseImage: { height: 180 },
  dashboardMockup: { flex: 1, backgroundColor: '#111827', borderRadius: 8, overflow: 'hidden' },
  mockupHeader: { backgroundColor: '#374151', paddingHorizontal: 12, paddingVertical: 8 },
  mockupTitleBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mockupTitle: { color: '#ffffff', fontSize: 10, fontWeight: '600' },
  mockupControls: { flexDirection: 'row' },
  controlDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6b7280', marginLeft: 4 },
  mockupContent: { flex: 1, padding: 12 },
  chartArea: { flex: 1, marginBottom: 12 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 60, marginBottom: 8 },
  bar: { width: 8, backgroundColor: '#3b82f6', marginRight: 2, borderRadius: 1 },
  courseCategoryTag: { backgroundColor: '#fef3c7', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, margin: 20, marginBottom: 12 },
  courseCategoryText: { color: '#92400e', fontSize: 12, fontWeight: '600' },
  courseTitle: { fontSize: 20, fontWeight: '700', color: '#065f46', marginHorizontal: 20, marginBottom: 4 },
  courseProvider: { fontSize: 16, color: '#6b7280', marginHorizontal: 20, marginBottom: 12 },
  courseDetails: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20, marginBottom: 12 },
  courseDetailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 4 },
  courseDetailText: { fontSize: 14, color: '#6b7280', marginLeft: 4 },
  courseDescription: { fontSize: 14, color: '#4b5563', lineHeight: 20, marginHorizontal: 20, marginBottom: 20 },
});

export default HomepageScreen;
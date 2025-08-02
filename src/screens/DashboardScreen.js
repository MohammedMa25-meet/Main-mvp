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
  TextInput,
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
  const [activeSidebarTab, setActiveSidebarTab] = useState('Home');
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [shuffledJobs, setShuffledJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bridgeITActiveTab, setBridgeITActiveTab] = useState('News');

  // State for live data
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState('workshop');

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

  // Bridge IT News data
  const bridgeITNews = useMemo(() => [
    {
      id: 1,
      title: t('Bridge IT Launches New AI-Powered Career Platform'),
      date: '2024-01-15',
      category: t('Company News'),
      content: t('Bridge IT is excited to announce the launch of our new AI-powered career platform designed to connect Palestinian talent with opportunities across the region.'),
      image: 'https://via.placeholder.com/300x200/556B2F/FFFFFF?text=Bridge+IT+News'
    },
    {
      id: 2,
      title: t('New Partnership with Gulf Tech Companies'),
      date: '2024-01-10',
      category: t('Partnerships'),
      content: t('We are proud to announce new partnerships with leading tech companies in the Gulf region, creating more opportunities for our community.'),
      image: 'https://via.placeholder.com/300x200/556B2F/FFFFFF?text=Partnerships'
    },
    {
      id: 3,
      title: t('Upcoming Career Development Workshops'),
      date: '2024-01-05',
      category: t('Events'),
      content: t('Join us for our upcoming series of career development workshops focused on cybersecurity and data science.'),
      image: 'https://via.placeholder.com/300x200/556B2F/FFFFFF?text=Workshops'
    }
  ], [t]);

  // Team members data
  const teamMembers = useMemo(() => [
    { name: 'Neave', role: 'PM', avatar: 'https://via.placeholder.com/60x60/556B2F/FFFFFF?text=N' },
    { name: 'Nada', role: 'PM', avatar: 'https://via.placeholder.com/60x60/556B2F/FFFFFF?text=N' },
    { name: 'Mohammed', role: 'Dev', avatar: 'https://via.placeholder.com/60x60/556B2F/FFFFFF?text=M' },
    { name: 'Nabih', role: 'Dev', avatar: 'https://via.placeholder.com/60x60/556B2F/FFFFFF?text=N' },
    { name: 'Nika', role: 'Dev', avatar: 'https://via.placeholder.com/60x60/556B2F/FFFFFF?text=N' },
    { name: 'Bashar', role: 'UX', avatar: 'https://via.placeholder.com/60x60/556B2F/FFFFFF?text=B' },
    { name: 'Madian', role: 'UX', avatar: 'https://via.placeholder.com/60x60/556B2F/FFFFFF?text=M' },
    { name: 'Hala', role: 'UX', avatar: 'https://via.placeholder.com/60x60/556B2F/FFFFFF?text=H' },
    { name: 'Tala', role: 'PR', avatar: 'https://via.placeholder.com/60x60/556B2F/FFFFFF?text=T' },
    { name: 'Hila', role: 'UI', avatar: 'https://via.placeholder.com/60x60/556B2F/FFFFFF?text=H' },
    { name: 'Elyan', role: 'UI', avatar: 'https://via.placeholder.com/60x60/556B2F/FFFFFF?text=E' }
  ], []);

  // Calendar events
  const calendarEvents = useMemo(() => [
    { date: '2024-01-15', title: t('Career Workshop'), type: 'workshop' },
    { date: '2024-01-20', title: t('Tech Meetup'), type: 'meetup' },
    { date: '2024-01-25', title: t('Interview Prep'), type: 'prep' },
    { date: '2024-01-30', title: t('Networking Event'), type: 'networking' }
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

  const filteredJobs = shuffledJobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.level && course.level.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Debug logging
  console.log('Search Query:', searchQuery);
  console.log('Total Jobs:', shuffledJobs.length);
  console.log('Filtered Jobs:', filteredJobs.length);
  console.log('Total Courses:', courses.length);
  console.log('Filtered Courses:', filteredCourses.length);

  const { isDarkMode } = useDarkMode();
  const containerStyle = isDarkMode ? styles.containerDark : styles.container;
  const cardStyle = isDarkMode ? styles.cardDark : styles.card;
  const textStyle = isDarkMode ? styles.textDark : styles.text;
  const titleStyle = isDarkMode ? styles.titleDark : styles.title;

  // Calendar helper functions
  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return calendarEvents.find(event => event.date === dateString);
  };

  const handleAddEvent = () => {
    if (newEventTitle.trim()) {
      const dateString = selectedDate.toISOString().split('T')[0];
      calendarEvents.push({
        date: dateString,
        title: newEventTitle,
        type: newEventType
      });
      setNewEventTitle('');
      setNewEventType('workshop');
      setShowEventModal(false);
      Alert.alert(t('Success'), t('Event added successfully!'));
    }
  };

  const renderCalendar = () => {
    const weekDays = getWeekDays(currentDate);
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];
    const weekRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    return (
      <ScrollView style={styles.calendarContainer} showsVerticalScrollIndicator={false}>
        <Text style={[styles.calendarTitle, titleStyle]}>{t('Calendar')}</Text>
        <Text style={[styles.calendarSubtitle, textStyle]}>{t('Upcoming events and workshops')}</Text>
        
        <View style={[styles.calendarCard, cardStyle]}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              style={styles.calendarNavButton}
              onPress={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
            >
              <Ionicons name="chevron-back" size={20} color={isDarkMode ? "#FFFFFF" : "#1F2937"} />
            </TouchableOpacity>
            <Text style={[styles.calendarMonth, titleStyle]}>{weekRange}</Text>
            <TouchableOpacity 
              style={styles.calendarNavButton}
              onPress={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
            >
              <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#FFFFFF" : "#1F2937"} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.calendarWeekHeader}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <Text key={`header-${index}`} style={[styles.calendarDayHeader, textStyle]}>{day}</Text>
            ))}
          </View>
          
          <View style={styles.calendarWeekGrid}>
            {weekDays.map((day, index) => {
              const event = getEventForDate(day);
              const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
              const isToday = new Date().toDateString() === day.toDateString();
              
              return (
                <TouchableOpacity
                  key={`day-${index}`}
                  style={[
                    styles.calendarWeekDay,
                    isToday && styles.calendarDayToday,
                    isSelected && styles.calendarDaySelected,
                    event && styles.calendarDayWithEvent
                  ]}
                  onPress={() => setSelectedDate(day)}
                >
                  <Text style={[
                    styles.calendarWeekDayText,
                    isToday && styles.calendarDayTextToday,
                    isSelected && styles.calendarDayTextSelected,
                    event && styles.calendarDayTextWithEvent
                  ]}>
                    {day.getDate()}
                  </Text>
                  {event && (
                    <View style={[
                      styles.calendarEventIndicator, 
                      { backgroundColor: event.type === 'workshop' ? '#556B2F' : event.type === 'meetup' ? '#3B82F6' : event.type === 'prep' ? '#F59E0B' : '#8B5CF6' }
                    ]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          
          {selectedDate && (
            <View style={styles.calendarEventDetails}>
              <View style={styles.calendarEventHeader}>
                <Text style={[styles.calendarEventDate, titleStyle]}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => setSelectedDate(null)}>
                  <Ionicons name="close" size={20} color={isDarkMode ? "#FFFFFF" : "#6B7280"} />
                </TouchableOpacity>
              </View>
              {getEventForDate(selectedDate) ? (
                <View style={[styles.calendarEventCard, cardStyle]}>
                  <View style={styles.calendarEventHeader}>
                    <View style={[
                      styles.calendarEventTypeBadge,
                      { backgroundColor: getEventForDate(selectedDate).type === 'workshop' ? '#556B2F' : getEventForDate(selectedDate).type === 'meetup' ? '#3B82F6' : getEventForDate(selectedDate).type === 'prep' ? '#F59E0B' : '#8B5CF6' }
                    ]}>
                      <Text style={styles.calendarEventTypeText}>{getEventForDate(selectedDate).type}</Text>
                    </View>
                    <Text style={[styles.calendarEventTime, textStyle]}>9:00 AM - 11:00 AM</Text>
                  </View>
                  <Text style={[styles.calendarEventTitle, titleStyle]}>{getEventForDate(selectedDate).title}</Text>
                  <Text style={[styles.calendarEventDescription, textStyle]}>
                    {getEventForDate(selectedDate).type === 'workshop' ? 'Join us for an interactive workshop to enhance your career skills.' :
                     getEventForDate(selectedDate).type === 'meetup' ? 'Network with industry professionals and share knowledge.' :
                     getEventForDate(selectedDate).type === 'prep' ? 'Prepare for your upcoming interviews with expert guidance.' :
                     'Connect with peers and expand your professional network.'}
                  </Text>
                </View>
              ) : (
                <View style={[styles.calendarNoEventCard, cardStyle]}>
                  <Ionicons name="calendar-outline" size={32} color={isDarkMode ? "#6B7280" : "#9CA3AF"} />
                  <Text style={[styles.calendarNoEvent, textStyle]}>{t('No events scheduled')}</Text>
                  <Text style={[styles.calendarNoEventSubtext, textStyle]}>{t('Tap any date to add an event')}</Text>
                  <TouchableOpacity 
                    style={styles.addEventButton}
                    onPress={() => setShowEventModal(true)}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.addEventButtonText}>{t('Add Event')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Event Creation Modal */}
        {showEventModal && (
          <View style={styles.eventModalOverlay}>
            <View style={[styles.eventModal, cardStyle]}>
              <Text style={[styles.eventModalTitle, titleStyle]}>{t('Add New Event')}</Text>
              
              <TextInput
                style={[styles.eventModalInput, isDarkMode && styles.eventModalInputDark]}
                placeholder={t('Event title')}
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                value={newEventTitle}
                onChangeText={setNewEventTitle}
              />
              
              <View style={styles.eventTypeContainer}>
                <Text style={[styles.eventTypeLabel, textStyle]}>{t('Event Type:')}</Text>
                <View style={styles.eventTypeButtons}>
                  {['workshop', 'meetup', 'prep', 'networking'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.eventTypeButton,
                        newEventType === type && styles.eventTypeButtonSelected,
                        { backgroundColor: newEventType === type ? 
                          (type === 'workshop' ? '#556B2F' : type === 'meetup' ? '#3B82F6' : type === 'prep' ? '#F59E0B' : '#8B5CF6') : 
                          'transparent'
                        }
                      ]}
                      onPress={() => setNewEventType(type)}
                    >
                      <Text style={[
                        styles.eventTypeButtonText,
                        newEventType === type && styles.eventTypeButtonTextSelected
                      ]}>
                        {t(type.charAt(0).toUpperCase() + type.slice(1))}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.eventModalButtons}>
                <TouchableOpacity 
                  style={styles.eventModalCancelButton}
                  onPress={() => {
                    setShowEventModal(false);
                    setNewEventTitle('');
                    setNewEventType('workshop');
                  }}
                >
                  <Text style={styles.eventModalCancelText}>{t('Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.eventModalAddButton}
                  onPress={handleAddEvent}
                >
                  <Text style={styles.eventModalAddText}>{t('Add Event')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderBridgeIT = () => (
    <View style={styles.bridgeITContainer}>
      <Text style={[styles.bridgeITTitle, titleStyle]}>{t('Bridge IT')}</Text>
      <Text style={[styles.bridgeITSubtitle, textStyle]}>{t('Latest updates and team information')}</Text>
      
      <View style={styles.bridgeITTabs}>
        <TouchableOpacity 
          style={[styles.bridgeITTab, bridgeITActiveTab === 'News' && styles.bridgeITActiveTab]} 
          onPress={() => setBridgeITActiveTab('News')}
        >
          <Ionicons name="newspaper-outline" size={20} color={bridgeITActiveTab === 'News' ? "#065F46" : "#6B7280"} />
          <Text style={[styles.bridgeITTabText, bridgeITActiveTab === 'News' ? titleStyle : textStyle]}>{t('News')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.bridgeITTab, bridgeITActiveTab === 'Team' && styles.bridgeITActiveTab]} 
          onPress={() => setBridgeITActiveTab('Team')}
        >
          <Ionicons name="people-outline" size={20} color={bridgeITActiveTab === 'Team' ? "#065F46" : "#6B7280"} />
          <Text style={[styles.bridgeITTabText, bridgeITActiveTab === 'Team' ? titleStyle : textStyle]}>{t('Team')}</Text>
        </TouchableOpacity>
      </View>

      {bridgeITActiveTab === 'News' ? (
        <ScrollView style={styles.bridgeITContent} showsVerticalScrollIndicator={false}>
          {bridgeITNews.map((news) => (
            <View key={news.id} style={[styles.newsCard, cardStyle]}>
              <Image source={{ uri: news.image }} style={styles.newsImage} />
              <View style={styles.newsContent}>
                <View style={styles.newsHeader}>
                  <Text style={[styles.newsCategory, textStyle]}>{news.category}</Text>
                  <Text style={[styles.newsDate, textStyle]}>{news.date}</Text>
                </View>
                <Text style={[styles.newsTitle, titleStyle]}>{news.title}</Text>
                <Text style={[styles.newsContent, textStyle]}>{news.content}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView style={styles.bridgeITContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.teamTitle, titleStyle]}>{t('Meet the Team')}</Text>
          <View style={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <View key={index} style={[styles.teamMemberCard, cardStyle]}>
                <Image source={{ uri: member.avatar }} style={styles.teamMemberAvatar} />
                <Text style={[styles.teamMemberName, titleStyle]}>{member.name}</Text>
                <Text style={[styles.teamMemberRole, textStyle]}>{member.role}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );

  const renderMainContent = () => {
    if (activeSidebarTab === 'Calendar') {
      return renderCalendar();
    } else if (activeSidebarTab === 'Bridge IT') {
      return renderBridgeIT();
    } else {
      // Default home content
      return (
        <>
          {/* AI Recommendations Text */}
          <View style={styles.aiRecommendationsContainer}>
            <Ionicons name="analytics" size={20} color="#556B2F" />
            <Text style={[styles.aiRecommendationsText, isDarkMode && styles.aiRecommendationsTextDark]}>
              {activeTab === 'Courses' 
                ? t('These are courses advanced by our AI to build your profile')
                : t('These are jobs you can apply for recommended by our AI')
              }
            </Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tab, activeTab === 'Jobs' ? styles.activeTab : styles.inactiveTab]} onPress={() => setActiveTab('Jobs')}><Ionicons name="briefcase-outline" size={20} color={activeTab === 'Jobs' ? "#1f2937" : "#9ca3af"} /><Text style={[styles.tabText, activeTab === 'Jobs' ? styles.activeTabText : styles.inactiveTabText]}>{t('Jobs')}</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'Courses' ? styles.activeTab : styles.inactiveTab]} onPress={() => setActiveTab('Courses')}><Ionicons name="book-outline" size={20} color={activeTab === 'Courses' ? "#1f2937" : "#9ca3af"} /><Text style={[styles.tabText, activeTab === 'Courses' ? styles.activeTabText : styles.inactiveTabText]}>{t('Courses')}</Text></TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, isDarkMode && styles.searchBarDark]}>
              <Ionicons name="search" size={20} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
              <TextInput
                style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
                placeholder={activeTab === 'Jobs' ? t('Search jobs...') : t('Search courses...')}
                placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                </TouchableOpacity>
              )}
            </View>
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
                {filteredJobs.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={48} color={isDarkMode ? "#6B7280" : "#9CA3AF"} />
                    <Text style={[styles.emptyStateText, isDarkMode && styles.emptyStateTextDark]}>
                      {searchQuery ? t('No jobs found matching your search') : t('No jobs available at the moment')}
                    </Text>
                  </View>
                ) : (
                  filteredJobs.map((job) => (
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
                  ))
                )}
              </View>
            ) : (
              <View>
                {filteredCourses.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={48} color={isDarkMode ? "#6B7280" : "#9CA3AF"} />
                    <Text style={[styles.emptyStateText, isDarkMode && styles.emptyStateTextDark]}>
                      {searchQuery ? t('No courses found matching your search') : t('No courses available at the moment')}
                    </Text>
                  </View>
                ) : (
                  filteredCourses.map((course) => (
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
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </>
      );
    }
  };

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
            <TouchableOpacity 
              style={[styles.menuItem, activeSidebarTab === 'Home' && styles.activeMenuItem]} 
              onPress={() => setActiveSidebarTab('Home')}
            >
              <Ionicons name="home" size={20} color={activeSidebarTab === 'Home' ? "#065F46" : "#6B7280"} />
              <Text style={[styles.menuText, activeSidebarTab === 'Home' ? titleStyle : textStyle]}>{t('Home')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, activeSidebarTab === 'Calendar' && styles.activeMenuItem]} 
              onPress={() => setActiveSidebarTab('Calendar')}
            >
              <Ionicons name="calendar-outline" size={20} color={activeSidebarTab === 'Calendar' ? "#065F46" : "#6B7280"} />
              <Text style={[styles.menuText, activeSidebarTab === 'Calendar' ? titleStyle : textStyle]}>{t('Calendar')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, activeSidebarTab === 'Bridge IT' && styles.activeMenuItem]} 
              onPress={() => setActiveSidebarTab('Bridge IT')}
            >
              <Ionicons name="business-outline" size={20} color={activeSidebarTab === 'Bridge IT' ? "#065F46" : "#6B7280"} />
              <Text style={[styles.menuText, activeSidebarTab === 'Bridge IT' ? titleStyle : textStyle]}>{t('Bridge IT')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleProfilePress}>
              <Ionicons name="person" size={20} color="#6B7280" />
              <Text style={[styles.menuText, textStyle]}>{t('Profile')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleSettingsPress}>
              <Ionicons name="settings-outline" size={20} color="#6B7280" />
              <Text style={[styles.menuText, textStyle]}>{t('Settings')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={[styles.menuText, { color: '#EF4444' }]}>{t('Logout')}</Text>
            </TouchableOpacity>
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
        
        {renderMainContent()}
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
  aiRecommendationsContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16, backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12 },
  aiRecommendationsText: { fontSize: 14, color: '#065f46', marginLeft: 8, fontWeight: '600' },
  aiRecommendationsTextDark: { color: '#10b981' },
  searchContainer: { marginHorizontal: 20, marginBottom: 24 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  searchBarDark: { backgroundColor: '#374151', borderColor: '#4b5563', borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 16, color: '#374151', paddingVertical: 0 },
  searchInputDark: { color: '#D1D5DB' },
  emptyState: { alignItems: 'center', paddingVertical: 50 },
  emptyStateText: { fontSize: 16, color: '#6b7280', marginTop: 12 },
  emptyStateTextDark: { color: '#9ca3af' },
  calendarContainer: { paddingHorizontal: 20, paddingVertical: 24 },
  calendarTitle: { fontSize: 20, fontWeight: '700', color: '#065f46', marginBottom: 8 },
  calendarSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  calendarCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, alignItems: 'center' },
  calendarText: { fontSize: 16, color: '#4b5563', textAlign: 'center' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  calendarMonth: { fontSize: 18, fontWeight: '700', color: '#065f46' },
  calendarNavButton: { padding: 8, borderRadius: 8 },
  calendarWeekHeader: { flexDirection: 'row', marginBottom: 8 },
  calendarDayHeader: { fontSize: 14, color: '#6b7280', fontWeight: '600', textAlign: 'center', width: (100 / 7) + '%' },
  calendarWeekGrid: { flexDirection: 'row', marginBottom: 16 },
  calendarWeekDay: {
    width: (100 / 7) + '%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 8,
  },
  calendarWeekDayText: { fontSize: 16, color: '#374151' },
  calendarDayEmpty: { width: (100 / 7) + '%', aspectRatio: 1 },
  calendarDayText: { fontSize: 16, color: '#374151' },
  calendarDaySelected: { backgroundColor: '#065F46', borderRadius: 8 },
  calendarDayTextSelected: { color: '#ffffff', fontWeight: '600' },
  calendarDayWithEvent: { backgroundColor: '#f0fdf4', borderRadius: 8 },
  calendarDayTextWithEvent: { color: '#065F46', fontWeight: '600' },
  calendarDayToday: { backgroundColor: '#e0f2fe', borderRadius: 8 },
  calendarDayTextToday: { color: '#065F46', fontWeight: '600' },
  calendarEventIndicator: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  calendarEventDetails: { marginTop: 20, paddingHorizontal: 20 },
  calendarEventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calendarEventDate: { fontSize: 18, fontWeight: '700', color: '#065f46' },
  calendarEventCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  calendarEventTitle: { fontSize: 18, fontWeight: '700', color: '#065f46', marginBottom: 4 },
  calendarEventTypeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  calendarEventTypeText: { fontSize: 12, fontWeight: '600', color: '#ffffff' },
  calendarEventTime: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  calendarEventDescription: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  calendarNoEventCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 20 },
  calendarNoEvent: { fontSize: 16, color: '#6b7280', marginTop: 12 },
  calendarNoEventSubtext: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  addEventButton: { backgroundColor: '#065F46', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  addEventButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  bridgeITContainer: { paddingHorizontal: 20, paddingVertical: 24 },
  bridgeITTitle: { fontSize: 20, fontWeight: '700', color: '#065f46', marginBottom: 8 },
  bridgeITSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  bridgeITTabs: { flexDirection: 'row', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  bridgeITTab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  bridgeITActiveTab: { borderBottomColor: '#065F46' },
  bridgeITTabText: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  bridgeITContent: { paddingHorizontal: 20 },
  newsCard: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  newsImage: { width: 100, height: 70, borderRadius: 8 },
  newsContent: { flex: 1, padding: 12 },
  newsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  newsCategory: { backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, fontSize: 12, fontWeight: '600', color: '#1d4ed8' },
  newsDate: { fontSize: 12, color: '#6b7280' },
  newsTitle: { fontSize: 18, fontWeight: '700', color: '#065f46', marginBottom: 4 },
  newsContent: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  teamTitle: { fontSize: 20, fontWeight: '700', color: '#065f46', marginTop: 24, marginBottom: 16 },
  teamGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  teamMemberCard: { alignItems: 'center', marginBottom: 20 },
  teamMemberAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
  teamMemberName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  teamMemberRole: { fontSize: 14, color: '#6b7280' },
  eventModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1001 },
  eventModal: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 10 },
  eventModalDark: { backgroundColor: '#1F2937' },
  eventModalTitle: { fontSize: 20, fontWeight: '700', color: '#065F46', textAlign: 'center', marginBottom: 20 },
  eventModalInput: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#374151', marginBottom: 20 },
  eventModalInputDark: { color: '#D1D5DB', backgroundColor: '#374151' },
  eventTypeContainer: { marginBottom: 20 },
  eventTypeLabel: { fontSize: 16, color: '#6B7280', marginBottom: 8 },
  eventTypeButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  eventTypeButton: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  eventTypeButtonSelected: { borderColor: '#065F46', borderWidth: 2 },
  eventTypeButtonText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  eventTypeButtonTextSelected: { color: '#065F46' },
  eventModalButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  eventModalCancelButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  eventModalCancelText: { fontSize: 16, color: '#6B7280' },
  eventModalAddButton: { backgroundColor: '#065F46', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  eventModalAddText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default HomepageScreen;
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import JobDetailModal from '../components/JobDetailModal';
import CourseDetailModal from '../components/CourseDetailModal';
import { useDarkMode } from '../context/DarkModeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

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
  const [shuffledCourses, setShuffledCourses] = useState([]);
  const { isDarkMode } = useDarkMode();

  // Debug logging
  console.log('DashboardScreen - Current userData:', userData);
  console.log('DashboardScreen - Profile image:', userData.profileImage);

  // Sample job data with the jobs from the image
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

  // Sample course data
  const courses = useMemo(() => [
    {
      id: 1,
      title: t('Data Science with Python'),
      provider: 'Palestine Polytechnic University',
      delivery: t('Remote'),
      duration: '20 weeks',
      level: t('Advanced'),
      price: '$1299',
      description: t('Master data analysis, visualization, and machine learning with Python. This comprehensive course covers everything from basic statistics to advanced machine learning algorithms.'),
      helpReason: t('Given the increasing demand for data scientists in the region, this course will significantly enhance your career prospects. Your technical background makes you a perfect fit.'),
      skills: [t('Data Analysis'), t('Machine Learning'), t('Python Programming'), t('Statistical Modeling')],
      outline: [
        {
          title: t('Introduction to Data Science'),
          description: t('Overview of data science concepts and tools'),
          duration: '2 weeks'
        },
        {
          title: t('Python for Data Analysis'),
          description: t('Learn pandas, numpy, and matplotlib'),
          duration: '4 weeks'
        },
        {
          title: t('Machine Learning Fundamentals'),
          description: t('Supervised and unsupervised learning algorithms'),
          duration: '6 weeks'
        }
      ],
      prerequisites: [
        t('Basic programming knowledge'),
        t('Understanding of mathematics and statistics'),
        t('Familiarity with Python basics')
      ]
    },
    {
      id: 2,
      title: t('Cybersecurity Fundamentals'),
      provider: 'An-Najah National University',
      delivery: t('Remote'),
      duration: '12 weeks',
      level: t('Beginner'),
      price: '$599',
      description: t('Learn essential cybersecurity concepts and practical skills to protect digital assets and understand security threats.'),
      helpReason: t('Given the increasing digital transformation in Gulf countries, cybersecurity expertise is in extremely high demand. Your technical background makes you a perfect fit.'),
      skills: [t('Network security protocols'), t('Threat assessment'), t('Security tools'), t('Incident response')],
      outline: [
        {
          title: t('Introduction to Cybersecurity'),
          description: t('Basic concepts and threat landscape'),
          duration: '2 weeks'
        },
        {
          title: t('Network Security'),
          description: t('Understanding network vulnerabilities and protection'),
          duration: '4 weeks'
        },
        {
          title: t('Security Tools and Practices'),
          description: t('Hands-on experience with security tools'),
          duration: '4 weeks'
        }
      ],
      prerequisites: [
        t('Basic computer knowledge'),
        t('Understanding of networking concepts'),
        t('No prior security experience required')
      ]
    },
    {
      id: 3,
      title: t('Mobile App Development (React Native)'),
      provider: 'Al-Quds University',
      delivery: t('Remote'),
      duration: '14 weeks',
      level: t('Intermediate'),
      price: '$799',
      description: t('Build cross-platform mobile applications using React Native. Learn to create apps for both iOS and Android platforms.'),
      helpReason: t('Mobile development is one of the fastest-growing fields in tech. Your JavaScript knowledge will give you a head start in React Native development.'),
      skills: [t('React Native'), t('Mobile UI/UX'), t('Cross-platform development'), t('App deployment')],
      outline: [
        {
          title: t('React Native Basics'),
          description: t('Introduction to React Native framework'),
          duration: '3 weeks'
        },
        {
          title: t('Mobile UI Development'),
          description: t('Creating responsive mobile interfaces'),
          duration: '4 weeks'
        },
        {
          title: t('App Deployment'),
          description: t('Publishing to app stores'),
          duration: '2 weeks'
        }
      ],
      prerequisites: [
        t('JavaScript knowledge'),
        t('Basic React understanding'),
        t('Familiarity with mobile apps')
      ]
    },
    {
      id: 4,
      title: t('UI/UX Design Masterclass'),
      provider: 'Gaza University',
      delivery: t('Remote'),
      duration: '18 weeks',
      level: t('Beginner'),
      price: '$749',
      description: t('Master user interface and user experience design principles. Learn to create intuitive and beautiful digital experiences.'),
      helpReason: t('Design skills are increasingly valuable in the tech industry. This course will complement your technical skills and open new career opportunities.'),
      skills: [t('User Research'), t('Wireframing'), t('Prototyping'), t('Design Systems')],
      outline: [
        {
          title: t('Design Fundamentals'),
          description: t('Principles of good design'),
          duration: '3 weeks'
        },
        {
          title: t('User Research'),
          description: t('Understanding user needs and behaviors'),
          duration: '4 weeks'
        },
        {
          title: t('Prototyping'),
          description: t('Creating interactive prototypes'),
          duration: '4 weeks'
        }
      ],
      prerequisites: [
        t('No prior design experience required'),
        t('Basic computer skills'),
        t('Creative mindset')
      ]
    },
    {
      id: 5,
      title: t('Cloud Computing with AWS'),
      provider: 'Bethlehem University',
      delivery: t('Remote'),
      duration: '10 weeks',
      level: t('Intermediate'),
      price: '$699',
      description: t('Learn cloud architecture and AWS services to deploy and manage applications in the cloud.'),
      helpReason: t('Cloud computing skills are essential for modern software development. This course will prepare you for cloud-based roles.'),
      skills: [t('AWS Services'), t('Cloud Architecture'), t('DevOps'), t('Infrastructure as Code')],
      outline: [
        {
          title: t('AWS Fundamentals'),
          description: t('Introduction to AWS services'),
          duration: '2 weeks'
        },
        {
          title: t('Cloud Architecture'),
          description: t('Designing scalable cloud solutions'),
          duration: '4 weeks'
        },
        {
          title: t('DevOps Practices'),
          description: t('CI/CD and automation'),
          duration: '3 weeks'
        }
      ],
      prerequisites: [
        t('Basic programming knowledge'),
        t('Understanding of web technologies'),
        t('Familiarity with command line')
      ]
    },
    {
      id: 6,
      title: t('Full Stack Web Development Bootcamp'),
      provider: 'Birzeit University',
      delivery: t('Remote'),
      duration: '16 weeks',
      level: t('Intermediate'),
      price: '$899',
      description: t('Complete web development course covering frontend and backend technologies. Build full-stack applications from scratch.'),
      helpReason: t('Full-stack developers are in high demand. This comprehensive course will prepare you for modern web development roles.'),
      skills: [t('HTML/CSS'), t('JavaScript'), t('Node.js'), t('Database Design')],
      outline: [
        {
          title: t('Frontend Development'),
          description: t('HTML, CSS, and JavaScript fundamentals'),
          duration: '4 weeks'
        },
        {
          title: t('Backend Development'),
          description: t('Server-side programming with Node.js'),
          duration: '4 weeks'
        },
        {
          title: t('Database Design'),
          description: t('Database modeling and SQL'),
          duration: '3 weeks'
        },
        {
          title: t('Full Stack Integration'),
          description: t('Connecting frontend and backend'),
          duration: '3 weeks'
        }
      ],
      prerequisites: [
        t('Basic computer skills'),
        t('No prior programming experience required'),
        t('Willingness to learn and practice')
      ]
    }
  ], [t]);

  // Initialize shuffled arrays when jobs and courses change
  React.useEffect(() => {
    setShuffledJobs([...jobs]);
    setShuffledCourses([...courses]);
  }, [jobs, courses]);

  const handleMenuPress = () => {
    setShowSidebar(!showSidebar);
  };

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
    if (onScreenChange) {
      onScreenChange('Profile');
    }
  };

  const handleSettingsPress = () => {
    setShowSidebar(false);
    if (onScreenChange) {
      onScreenChange('Settings');
    }
  };

  const handleLogout = () => {
    setShowSidebar(false);
    // Clear user data and navigate back to welcome screen
    clearUserData();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const handleRefreshSuggestions = () => {
    // Shuffle jobs and courses
    const newShuffledJobs = [...jobs].sort(() => Math.random() - 0.5);
    const newShuffledCourses = [...courses].sort(() => Math.random() - 0.5);
    setShuffledJobs(newShuffledJobs);
    setShuffledCourses(newShuffledCourses);
    Alert.alert(t('Success'), t('AI suggestions refreshed and shuffled!'));
  };

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
              {userData.profileImage ? (
                <Image 
                  source={{ uri: userData.profileImage }} 
                  style={styles.logoCircle}
                  resizeMode="cover"
                  onLoad={() => {
                    console.log('Sidebar header image loaded successfully:', userData.profileImage);
                  }}
                  onError={(error) => {
                    console.error('Sidebar header image loading error:', error);
                    console.log('Profile image URI:', userData.profileImage);
                    clearUserData();
                  }}
                />
              ) : (
                <View style={styles.logoCircle}>
                  <Ionicons name="person" size={20} color="#FFFFFF" />
                </View>
              )}
              <Text style={[styles.logoTitle, titleStyle]}>BridgeIT</Text>
            </View>
          </View>

          <View style={styles.sidebarMenu}>
                         <TouchableOpacity style={[styles.menuItem, styles.activeMenuItem]}>
               <Ionicons name="home" size={20} color="#065F46" />
               <Text style={[styles.menuText, titleStyle]}>{t('Home')}</Text>
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
              <View>
                <Text style={[styles.userName, titleStyle]}>
                  {userData.firstName && userData.lastName 
                    ? `${userData.firstName} ${userData.lastName}` 
                    : userData.specialization || 'ICT Graduate'}
                </Text>
                <Text style={[styles.userLocation, textStyle]}>
                  {userData.location || 'West Bank'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Overlay to close sidebar when tapping outside */}
        {showSidebar && (
          <TouchableOpacity 
            style={styles.sidebarOverlay}
            activeOpacity={1}
            onPress={() => setShowSidebar(false)}
          />
        )}
        {/* Header */}
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleMenuPress}>
              <Ionicons name="menu" size={24} color={isDarkMode ? "#FFFFFF" : "#1f2937"} />
            </TouchableOpacity>
          </View>
          <View style={styles.logoContainer}>
            {userData.profileImage ? (
              <Image 
                source={{ uri: userData.profileImage }} 
                style={styles.logoCircle}
                resizeMode="cover"
                onLoad={() => {
                  console.log('Header logo image loaded successfully:', userData.profileImage);
                }}
                onError={(error) => {
                  console.error('Header logo image loading error:', error);
                  console.log('Profile image URI:', userData.profileImage);
                  clearUserData();
                }}
              />
            ) : (
              <View style={styles.logoCircle}>
                <Ionicons name="person" size={20} color="#FFFFFF" />
              </View>
            )}
            <Text style={[styles.logoTitle, titleStyle]}>BridgeIT</Text>
          </View>
          <TouchableOpacity onPress={handleRefreshSuggestions}>
            <Ionicons 
              name="refresh" 
              size={24} 
              color={isDarkMode ? "#FFFFFF" : "#1f2937"} 
            />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeSubtitle, textStyle]}>{t('Your career hub is ready.')}</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Jobs' ? styles.activeTab : styles.inactiveTab]}
            onPress={() => setActiveTab('Jobs')}
          >
            <Ionicons name="briefcase-outline" size={20} color={activeTab === 'Jobs' ? "#1f2937" : "#9ca3af"} />
            <Text style={[styles.tabText, activeTab === 'Jobs' ? styles.activeTabText : styles.inactiveTabText]}>
              {t('Jobs')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Courses' ? styles.activeTab : styles.inactiveTab]}
            onPress={() => setActiveTab('Courses')}
          >
            <Ionicons name="book-outline" size={20} color={activeTab === 'Courses' ? "#1f2937" : "#9ca3af"} />
            <Text style={[styles.tabText, activeTab === 'Courses' ? styles.activeTabText : styles.inactiveTabText]}>
              {t('Courses')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'Jobs' ? (
            <View style={styles.content}>
              {shuffledJobs.map((job) => (
                <TouchableOpacity 
                  key={job.id} 
                  style={[styles.jobCard, cardStyle]}
                  onPress={() => handleJobPress(job)}
                >
                  <View style={styles.jobHeader}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryText}>{job.category}</Text>
                    </View>
                    <View style={styles.jobIcon}>
                      <View style={styles.iconContainer}>
                        <View style={styles.iconBar1} />
                        <View style={styles.iconBar2} />
                        <View style={styles.iconBar3} />
                      </View>
                    </View>
                  </View>
                  
                  <Text style={[styles.jobTitle, titleStyle]}>{job.title}</Text>
                  <Text style={[styles.companyName, textStyle]}>{job.company}</Text>
                  
                  <View style={styles.jobDetails}>
                    <View style={styles.jobDetailItem}>
                      <Ionicons name="location-outline" size={16} color="#6b7280" />
                      <Text style={styles.jobDetailText}>{job.location}</Text>
                    </View>
                    <View style={styles.jobDetailItem}>
                      <Ionicons name="business-outline" size={16} color="#6b7280" />
                      <Text style={styles.jobDetailText}>{job.workType}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.salaryContainer}>
                    <Ionicons name="cash-outline" size={16} color="#6b7280" />
                    <Text style={styles.salaryText}>{job.salary}</Text>
                  </View>
                  
                  <Text style={[styles.jobDescription, textStyle]}>
                    {job.description}
                  </Text>
                  
                  <TouchableOpacity style={styles.viewDetailsButton} onPress={() => handleJobPress(job)}>
                    <Text style={styles.viewDetailsText}>{t('View Details')}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.content}>
              {shuffledCourses.map((course) => (
                <TouchableOpacity 
                  key={course.id} 
                  style={[styles.courseCard, cardStyle]}
                  onPress={() => handleCoursePress(course)}
                >
                  <View style={styles.courseImage}>
                    <View style={styles.dashboardMockup}>
                      <View style={styles.mockupHeader}>
                        <View style={styles.mockupTitleBar}>
                          <Text style={styles.mockupTitle}>COURSE PREVIEW</Text>
                          <View style={styles.mockupControls}>
                            <View style={styles.controlDot} />
                            <View style={styles.controlDot} />
                            <View style={styles.controlDot} />
                          </View>
                        </View>
                      </View>
                      <View style={styles.mockupContent}>
                        <View style={styles.chartArea}>
                          <View style={styles.barChart}>
                            {[...Array(8)].map((_, i) => (
                              <View key={i} style={[styles.bar, { height: Math.random() * 40 + 10 }]} />
                            ))}
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.courseCategoryTag}>
                    <Text style={styles.courseCategoryText}>{course.title.includes('Data') ? t('Data Science') : course.title.includes('Security') ? t('Cybersecurity') : course.title.includes('Mobile') ? t('Mobile Development') : course.title.includes('UI') ? t('UI/UX Design') : course.title.includes('Cloud') ? t('DevOps') : t('Web Development')}</Text>
                  </View>
                  
                  <Text style={[styles.courseTitle, titleStyle]}>{course.title}</Text>
                  <Text style={[styles.courseProvider, textStyle]}>{course.provider}</Text>
                  
                  <View style={styles.courseDetails}>
                    <View style={styles.courseDetailItem}>
                      <Ionicons name="globe-outline" size={16} color="#6b7280" />
                      <Text style={styles.courseDetailText}>{course.delivery}</Text>
                    </View>
                    <View style={styles.courseDetailItem}>
                      <Ionicons name="time-outline" size={16} color="#6b7280" />
                      <Text style={styles.courseDetailText}>{course.duration}</Text>
                    </View>
                    <View style={styles.courseDetailItem}>
                      <Ionicons name="trending-up-outline" size={16} color="#6b7280" />
                      <Text style={styles.courseDetailText}>{course.level}</Text>
                    </View>
                    <View style={styles.courseDetailItem}>
                      <Ionicons name="cash-outline" size={16} color="#6b7280" />
                      <Text style={styles.courseDetailText}>{course.price}</Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.courseDescription, textStyle]}>
                    {course.description}
                  </Text>
                  
                  <TouchableOpacity style={styles.viewDetailsButton} onPress={() => handleCoursePress(course)}>
                    <Text style={styles.viewDetailsText}>{t('View Details')}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Modals */}
      <JobDetailModal 
        visible={showJobModal}
        job={selectedJob}
        onClose={() => setShowJobModal(false)}
      />
      <CourseDetailModal 
        visible={showCourseModal}
        course={selectedCourse}
        onClose={() => setShowCourseModal(false)}
      />
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
    backgroundColor: '#111827',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sidebarDark: {
    backgroundColor: '#1F2937',
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
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#065F46',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065F46',
  },
  sidebarSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  sidebarMenu: {
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 4,
  },
  activeMenuItem: {
    backgroundColor: '#F0FDF4',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  menuText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 12,
  },
  sidebarFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  userLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    overflow: 'hidden',
  },
  userAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#065F46',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  headerDark: {
    backgroundColor: '#1F2937',
  },
  headerLeft: {
    marginRight: 16,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 4,
  },
  titleDark: {
    color: '#10B981',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '400',
  },
  textDark: {
    color: '#D1D5DB',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#1f2937',
  },
  inactiveTabText: {
    color: '#9ca3af',
  },
  content: {
    paddingHorizontal: 20,
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardDark: {
    backgroundColor: '#1F2937',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '600',
  },
  jobIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  iconBar1: {
    width: 3,
    height: 8,
    backgroundColor: '#3b82f6',
    marginRight: 2,
  },
  iconBar2: {
    width: 3,
    height: 12,
    backgroundColor: '#10b981',
    marginRight: 2,
  },
  iconBar3: {
    width: 3,
    height: 6,
    backgroundColor: '#f59e0b',
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 4,
  },
  title: {
    color: '#065f46',
  },
  companyName: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  text: {
    color: '#374151',
  },
  jobDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  jobDetailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  salaryText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  jobDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  viewDetailsButton: {
    backgroundColor: '#065f46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewDetailsText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  courseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  courseImage: {
    height: 200,
    backgroundColor: '#1f2937',
    padding: 16,
  },
  dashboardMockup: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 8,
    overflow: 'hidden',
  },
  mockupHeader: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mockupTitleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mockupTitle: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  mockupControls: {
    flexDirection: 'row',
  },
  controlDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6b7280',
    marginLeft: 4,
  },
  mockupContent: {
    flex: 1,
    padding: 12,
  },
  chartArea: {
    flex: 1,
    marginBottom: 12,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    marginBottom: 8,
  },
  bar: {
    width: 8,
    backgroundColor: '#3b82f6',
    marginRight: 2,
    borderRadius: 1,
  },
  lineChart: {
    height: 40,
    justifyContent: 'center',
  },
  lineChartLine: {
    height: 2,
    backgroundColor: '#10b981',
    borderRadius: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 8,
  },
  courseCategoryTag: {
    backgroundColor: '#fef3c7',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 20,
    marginBottom: 12,
  },
  courseCategoryText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065f46',
    marginHorizontal: 20,
    marginBottom: 4,
  },
  courseProvider: {
    fontSize: 16,
    color: '#6b7280',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  courseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  courseDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  courseDetailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
});

export default HomepageScreen;
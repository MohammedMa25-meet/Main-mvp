import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../context/DarkModeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

const CareerPlanScreen = ({ navigation, onScreenChange }) => {
  const { userData, updateUserData } = useUser();
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const [activeView, setActiveView] = useState('progress'); // 'progress' or 'calendar'

  const [careerPlan, setCareerPlan] = useState(userData.careerPlan || null);

  useEffect(() => {
    if (!userData.careerPlan) {
      const defaultCareerPlan = {
        goals: [
          {
            id: 'goal_1',
            title: 'Update CV with new skills',
            dueDate: '2025-08-04',
            completed: false,
            category: 'preparation',
            icon: 'document-text-outline'
          },
          {
            id: 'goal_2',
            title: 'Apply to 2 Frontend jobs',
            dueDate: '2025-08-27',
            completed: false,
            category: 'application',
            icon: 'briefcase-outline'
          },
          {
            id: 'goal_3',
            title: 'Apply to 3 Web Developer jobs',
            dueDate: '2025-08-13',
            completed: true,
            category: 'application',
            icon: 'briefcase-outline'
          },
          {
            id: 'goal_4',
            title: 'Complete "Intro to Web Dev" course',
            dueDate: '2025-08-20',
            completed: true,
            category: 'learning',
            icon: 'book-outline'
          },
          {
            id: 'goal_5',
            title: 'Learn React basics',
            dueDate: '2025-09-05',
            completed: true,
            category: 'skills',
            icon: 'code-outline'
          },
          {
            id: 'goal_6',
            title: 'Practice for technical interview',
            dueDate: '2025-09-20',
            completed: true,
            category: 'preparation',
            icon: 'chatbubble-outline'
          }
        ],
        progress: {
          coursesCompleted: { current: 1, total: 1 },
          jobsApplied: { current: 1, total: 2 },
          skillsAcquired: { current: 1, total: 1 },
          interviewPrep: { current: 1, total: 2 }
        }
      };
      setCareerPlan(defaultCareerPlan);
      updateUserData({ ...userData, careerPlan: defaultCareerPlan });
    } else {
      setCareerPlan(userData.careerPlan);
    }
    // Only run when userData.careerPlan changes
  }, [userData.careerPlan]);

  const toggleGoalCompletion = (goalId) => {
    const updatedGoals = careerPlan.goals.map(goal =>
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    );
    
    const updatedCareerPlan = { ...careerPlan, goals: updatedGoals };
    setCareerPlan(updatedCareerPlan);
    updateUserData({ ...userData, careerPlan: updatedCareerPlan });
  };

  const getProgressPercentage = (current, total) => {
    return total > 0 ? (current / total) * 100 : 0;
  };

  const getStatusColor = (completed) => {
    return completed ? '#10B981' : '#F59E0B';
  };

  const getStatusText = (completed, dueDate) => {
    if (completed) return 'DONE';
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'OVERDUE';
    if (diffDays === 0) return 'DUE TODAY';
    if (diffDays <= 7) return 'DUE SOON';
    return 'IN_PROGRESS';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const getMonthYear = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const groupGoalsByMonth = () => {
    const grouped = {};
    careerPlan.goals.forEach(goal => {
      const monthYear = getMonthYear(goal.dueDate);
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(goal);
    });
    return grouped;
  };

  const containerStyle = isDarkMode ? styles.containerDark : styles.container;
  const cardStyle = isDarkMode ? styles.cardDark : styles.card;
  const textStyle = isDarkMode ? styles.textDark : styles.text;
  const titleStyle = isDarkMode ? styles.titleDark : styles.title;

  const renderProgressView = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Progress Overview Section */}
      <View style={[styles.section, cardStyle]}>
        <Text style={[styles.sectionTitle, titleStyle]}>Progress Overview</Text>
        
        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Ionicons name="book-outline" size={20} color="#10B981" />
            <Text style={[styles.progressLabel, textStyle]}>Courses Completed</Text>
            <Text style={[styles.progressFraction, titleStyle]}>
              {careerPlan.progress.coursesCompleted.current}/{careerPlan.progress.coursesCompleted.total}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${getProgressPercentage(careerPlan.progress.coursesCompleted.current, careerPlan.progress.coursesCompleted.total)}%`, backgroundColor: '#10B981' }
              ]} 
            />
          </View>
        </View>

        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Ionicons name="briefcase-outline" size={20} color="#F59E0B" />
            <Text style={[styles.progressLabel, textStyle]}>Jobs Applied</Text>
            <Text style={[styles.progressFraction, titleStyle]}>
              {careerPlan.progress.jobsApplied.current}/{careerPlan.progress.jobsApplied.total}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${getProgressPercentage(careerPlan.progress.jobsApplied.current, careerPlan.progress.jobsApplied.total)}%`, backgroundColor: '#F59E0B' }
              ]} 
            />
          </View>
        </View>

        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Ionicons name="ribbon-outline" size={20} color="#8B5CF6" />
            <Text style={[styles.progressLabel, textStyle]}>Skills Acquired</Text>
            <Text style={[styles.progressFraction, titleStyle]}>
              {careerPlan.progress.skillsAcquired.current}/{careerPlan.progress.skillsAcquired.total}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${getProgressPercentage(careerPlan.progress.skillsAcquired.current, careerPlan.progress.skillsAcquired.total)}%`, backgroundColor: '#8B5CF6' }
              ]} 
            />
          </View>
        </View>

        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Ionicons name="chatbubble-outline" size={20} color="#EF4444" />
            <Text style={[styles.progressLabel, textStyle]}>Interview Prep</Text>
            <Text style={[styles.progressFraction, titleStyle]}>
              {careerPlan.progress.interviewPrep.current}/{careerPlan.progress.interviewPrep.total}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${getProgressPercentage(careerPlan.progress.interviewPrep.current, careerPlan.progress.interviewPrep.total)}%`, backgroundColor: '#EF4444' }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Your Goals Section */}
      <View style={[styles.section, cardStyle]}>
        <Text style={[styles.sectionTitle, titleStyle]}>Your Goals</Text>
        
        {careerPlan.goals.map((goal) => (
          <TouchableOpacity 
            key={goal.id} 
            style={styles.goalItem}
            onPress={() => toggleGoalCompletion(goal.id)}
          >
            <View style={styles.goalContent}>
              <TouchableOpacity 
                style={[
                  styles.checkbox, 
                  goal.completed && styles.checkboxCompleted
                ]}
                onPress={() => toggleGoalCompletion(goal.id)}
              >
                {goal.completed && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </TouchableOpacity>
              
              <View style={styles.goalText}>
                <Text style={[
                  styles.goalTitle, 
                  titleStyle,
                  goal.completed && styles.completedText
                ]}>
                  {goal.title}
                </Text>
                <Text style={[styles.goalDate, textStyle]}>
                  Due {formatDate(goal.dueDate)}, 2025
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderCalendarView = () => {
    const groupedGoals = groupGoalsByMonth();
    
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {Object.entries(groupedGoals).map(([monthYear, goals]) => (
          <View key={monthYear} style={[styles.section, cardStyle]}>
            <Text style={[styles.monthTitle, titleStyle]}>{monthYear}</Text>
            
            {goals.map((goal) => {
              const status = getStatusText(goal.completed, goal.dueDate);
              const statusColor = getStatusColor(goal.completed);
              
              return (
                <View key={goal.id} style={styles.calendarGoalItem}>
                  <View style={[styles.goalIcon, { backgroundColor: `${statusColor}20` }]}>
                    <Ionicons name={goal.icon} size={20} color={statusColor} />
                  </View>
                  
                  <View style={styles.calendarGoalContent}>
                    <Text style={[styles.calendarGoalTitle, titleStyle]}>
                      {goal.title}
                    </Text>
                    <Text style={[styles.calendarGoalTarget, textStyle]}>
                      Target: {formatDate(goal.dueDate)}
                    </Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: statusColor }
                  ]}>
                    <Text style={styles.statusText}>{status}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    );
  };

  if (!careerPlan) {
    return (
      <SafeAreaView style={containerStyle}>
        {/* Header */}
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <TouchableOpacity onPress={() => onScreenChange('Home')}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFFFFF" : "#1f2937"} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, titleStyle]}>Your Personalized Career Plan</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={textStyle}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity onPress={() => onScreenChange('Home')}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFFFFF" : "#1f2937"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, titleStyle]}>Your Personalized Career Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Career Progress Tracker Header */}
      <View style={[styles.trackerHeader, cardStyle]}>
        <View style={styles.trackerIcon}>
          <Ionicons name="rocket-outline" size={24} color="#10B981" />
        </View>
        <Text style={[styles.trackerTitle, titleStyle]}>Career Progress Tracker</Text>
        <Text style={[styles.trackerSubtitle, textStyle]}>
          Your roadmap to success. Visualize milestones and track your journey.
        </Text>
      </View>

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            activeView === 'progress' ? styles.activeToggle : styles.inactiveToggle
          ]}
          onPress={() => setActiveView('progress')}
        >
          <Ionicons 
            name="checkmark-done-outline" 
            size={20} 
            color={activeView === 'progress' ? "#1f2937" : "#9ca3af"} 
          />
          <Text style={[
            styles.toggleText, 
            activeView === 'progress' ? styles.activeToggleText : styles.inactiveToggleText
          ]}>
            Progress View
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            activeView === 'calendar' ? styles.activeToggle : styles.inactiveToggle
          ]}
          onPress={() => setActiveView('calendar')}
        >
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={activeView === 'calendar' ? "#1f2937" : "#9ca3af"} 
          />
          <Text style={[
            styles.toggleText, 
            activeView === 'calendar' ? styles.activeToggleText : styles.inactiveToggleText
          ]}>
            Career Calendar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeView === 'progress' ? renderProgressView() : renderCalendarView()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  containerDark: { flex: 1, backgroundColor: '#111827' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerDark: { backgroundColor: '#1F2937' },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065f46',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  
  trackerHeader: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
  },
  
  trackerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  
  trackerEmoji: {
    fontSize: 24,
  },
  
  trackerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 8,
  },
  
  trackerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  
  activeToggle: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  inactiveToggle: {
    backgroundColor: 'transparent',
  },
  
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  activeToggleText: { color: '#1f2937' },
  inactiveToggleText: { color: '#9ca3af' },
  
  section: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  
  card: { backgroundColor: '#FFFFFF' },
  cardDark: { backgroundColor: '#1F2937' },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 20,
  },
  
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 16,
  },
  
  progressItem: {
    marginBottom: 20,
  },
  
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  progressLabel: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  
  progressFraction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
  },
  
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  
  goalItem: {
    marginBottom: 16,
  },
  
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  
  goalText: {
    flex: 1,
  },
  
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  
  goalDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  calendarGoalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  calendarGoalContent: {
    flex: 1,
  },
  
  calendarGoalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  
  calendarGoalTarget: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Dark mode styles
  titleDark: { color: '#10B981' },
  title: { color: '#065f46' },
  textDark: { color: '#D1D5DB' },
  text: { color: '#374151' },
});

export default CareerPlanScreen;
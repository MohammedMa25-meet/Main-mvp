import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../context/DarkModeContext';
import { useLanguage } from '../context/LanguageContext';

const JobDetailsScreen = ({ route, navigation }) => {
  const { isDarkMode } = useDarkMode();
  const { t } = useLanguage();
  const [coverLetter, setCoverLetter] = useState('');

  // Get the specific job object passed from the homepage
  const { job } = route.params;

  if (!job) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        <Text style={isDarkMode ? styles.textDark : styles.text}>Job not found.</Text>
      </SafeAreaView>
    );
  }
  
  const handleApply = () => {
    if (job.job_url) {
      Linking.openURL(job.job_url);
    }
  };

  const containerStyle = isDarkMode ? styles.containerDark : styles.container;
  const cardStyle = isDarkMode ? styles.cardDark : styles.card;
  const textStyle = isDarkMode ? styles.textDark : styles.text;
  const titleStyle = isDarkMode ? styles.titleDark : styles.title;

  return (
    <SafeAreaView style={containerStyle}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFFFFF" : "#1F2937"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, titleStyle]}>{t('Job Details')}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Image 
              source={{ uri: job.image || 'https://source.unsplash.com/400x400/?company,logo' }} 
              style={styles.companyLogo} 
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.jobTitle, titleStyle]}>{job.title}</Text>
              <Text style={[styles.jobCompany, textStyle]}>{job.company} • {job.location}</Text>
            </View>
          </View>
          
          {/* AI ANALYSIS SECTION */}
          <View style={[styles.aiCard, cardStyle]}>
              <View style={styles.aiHeader}>
                  <Ionicons name="sparkles" size={20} color="#10B981" />
                  <Text style={[styles.aiTitle, titleStyle]}>{t('AI Analysis')}</Text>
              </View>
              <Text style={[styles.aiReasonTitle, textStyle]}>{t('Why this job suits you')}</Text>
              <Text style={[styles.aiReasonText, textStyle]}>
                  {job.reason || t('This job aligns well with your skills and experience.')}
              </Text>
              <Text style={[styles.aiSummaryTitle, textStyle]}>{t('AI Summary')}</Text>
              <Text style={[styles.aiSummaryText, textStyle]}>
                  {job.summary || job.description}
              </Text>
          </View>

          <Text style={[styles.descriptionTitle, titleStyle]}>{t('Full Description')}</Text>
          <Text style={[styles.descriptionText, textStyle]}>{job.description}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, isDarkMode && styles.footerDark]}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>{t('Apply Now')}</Text>
          <Ionicons name="open-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { flex: 1, backgroundColor: '#111827' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  content: { padding: 20, paddingBottom: 100 },
  titleSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  companyLogo: { width: 60, height: 60, borderRadius: 12, marginRight: 16, backgroundColor: '#E5E7EB' },
  jobTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  jobCompany: { fontSize: 16, color: '#6B7280' },
  aiCard: { marginBottom: 24, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiTitle: { fontSize: 18, fontWeight: '700', marginLeft: 8 },
  aiReasonTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  aiReasonText: { fontSize: 15, marginBottom: 12, fontStyle: 'italic', lineHeight: 22 },
  aiSummaryTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  aiSummaryText: { fontSize: 15, lineHeight: 22 },
  descriptionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  descriptionText: { fontSize: 16, lineHeight: 24 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  footerDark: { backgroundColor: '#111827', borderTopColor: '#374151'},
  applyButton: { backgroundColor: '#065f46', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
  applyButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginRight: 8 },
  text: { color: '#374151' },
  textDark: { color: '#D1D5DB' },
  title: { color: '#111827' },
  titleDark: { color: '#F9FAFB' },
});

export default JobDetailsScreen;
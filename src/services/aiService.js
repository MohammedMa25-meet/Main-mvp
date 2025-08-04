import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { fetchCourses } from './courseService';
import { fetchJobs } from './jobService';
import { testGenerators } from './testGenerators';

// TODO: Replace with your actual Gemini API Key.
// IMPORTANT: This is not secure for a production app.
const API_KEY = 'AIzaSyAID57D3UKZdSt8Fc-WarY_2rlN4jNAdro';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const getAiRecommendations = async (userData, courseCatalog, jobListings) => {
  console.log('AI Service: Analyzing user profile...');
  
  // Extract relevant information from the new questionnaire structure
  const careerGoal = userData.careerGoal || '';
  const employmentStatus = userData.employmentStatus || '';
  const experience = userData.experience || '';
  const university = userData.university || '';
  const fieldExperience = userData.fieldExperience || [];
  const desiredField = userData.desiredField || [];
  const dreamJob = userData.dreamJob || '';
  const remoteCountries = userData.remoteCountries || [];
  
  // Convert field experience and desired field to strings
  const fieldExperienceStr = Array.isArray(fieldExperience) 
    ? Object.keys(fieldExperience).join(', ')
    : fieldExperience;
  const desiredFieldStr = Array.isArray(desiredField)
    ? Object.keys(desiredField).join(', ')
    : desiredField;
  
  // Create detailed analysis of user profile
  const userProfile = {
    careerGoal,
    employmentStatus,
    experience,
    university,
    fieldExperience: fieldExperienceStr,
    desiredField: desiredFieldStr,
    dreamJob,
    remoteCountries: remoteCountries.join(', ')
  };
  
  console.log('Detailed user profile for AI analysis:', userProfile);
  
  const prompt = `
    You are an expert career advisor specializing in the Middle East and North Africa region, particularly Palestine and the West Bank.
    
    Analyze the user's profile and select the top 3 courses AND the top 3 jobs that are the best fit for their specific situation.
    
    USER PROFILE ANALYSIS:
    - Career Goal: "${careerGoal}" - This indicates their primary motivation
    - Employment Status: "${employmentStatus}" - This shows their current situation
    - Prior Experience: "${experience}" - This indicates their educational background
    - University: "${university}" - This shows their academic institution
    - Field Experience: "${fieldExperienceStr}" - This shows their practical experience areas
    - Desired Work Fields: "${desiredFieldStr}" - This shows where they want to work
    - Dream Job: "${dreamJob}" - This is their ultimate career goal
    - Remote Work Countries: "${remoteCountries.join(', ')}" - This shows their geographic preferences

    CONTEXT CONSIDERATIONS:
    1. If they're unemployed, prioritize courses that lead to immediate employment
    2. If they're employed but unsatisfied, focus on career advancement courses
    3. If they have field experience, recommend jobs that build on that experience
    4. If they have a dream job, recommend courses that directly support that goal
    5. Consider the Palestinian context and regional opportunities
    6. Focus on practical, skill-based courses that lead to tangible outcomes
    7. Recommend jobs that match their experience level and desired fields

    AVAILABLE COURSES (with their IDs and categories):
    ---
    ${JSON.stringify(courseCatalog.map(c => ({ 
      id: c.id, 
      title: c.title, 
      provider: c.provider, 
      skills: c.skills,
      category: c.category || 'General'
    })))}
    ---

    AVAILABLE JOBS (with their IDs and categories):
    ---
    ${JSON.stringify(jobListings.map(j => ({ 
      id: j.id, 
      title: j.title, 
      company: j.company, 
      category: j.category,
      level: j.level,
      workType: j.workType
    })))}
    ---

    INSTRUCTIONS:
    1. Analyze the user's profile thoroughly
    2. Match courses to their career goals and current situation
    3. Match jobs to their experience level and desired fields
    4. Consider regional context and opportunities
    5. Prioritize practical, actionable recommendations
    6. Return a single, valid JSON object with two keys: "recommendedCourseIds" and "recommendedJobIds"
    7. Each key must contain an array of the top 3 STRING IDs from the respective lists
    8. The output must be only the JSON object and nothing else
    9. If no good matches exist, select the most relevant general options
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const recommendations = JSON.parse(cleanedResponse);
    
    console.log('AI Recommendations:', recommendations);
    return recommendations;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // ✅ Return empty arrays on failure to prevent crashes
    return { recommendedCourseIds: [], recommendedJobIds: [] };
  }
};

export const runFullAiAnalysis = async (userData) => {
  console.log('Running full AI analysis for user:', userData.uid);
  try {
    // Use the new questionnaire structure to get search keywords
    let searchKeywords = 'professional development';
    
    console.log('User data for AI analysis:', {
      careerGoal: userData.careerGoal,
      fieldExperience: userData.fieldExperience,
      desiredField: userData.desiredField,
      experience: userData.experience,
      employmentStatus: userData.employmentStatus
    });
    
    if (userData.fieldExperience && Object.keys(userData.fieldExperience).length > 0) {
      searchKeywords = Object.keys(userData.fieldExperience).join(' ');
    } else if (userData.desiredField && Object.keys(userData.desiredField).length > 0) {
      searchKeywords = Object.keys(userData.desiredField).join(' ');
    } else if (userData.careerGoal) {
      searchKeywords = userData.careerGoal;
    }

    console.log('Search keywords:', searchKeywords);

    const [courseCatalog, jobListings] = await Promise.all([
      fetchCourses(searchKeywords),
      fetchJobs(searchKeywords)
    ]);

    // ✅ We no longer throw an error if one API fails. We proceed with what we have.
    console.log(`Found ${courseCatalog.length} courses and ${jobListings.length} jobs.`);

    // If AI fails, return some default recommendations
    let recommendedCourses = [];
    let recommendedJobs = [];

    try {
      const recommendedIds = await getAiRecommendations(userData, courseCatalog, jobListings);
      console.log('AI recommended IDs:', recommendedIds);
      
      recommendedCourses = (recommendedIds.recommendedCourseIds || []).map(id => 
        courseCatalog.find(course => course.id === id)
      ).filter(Boolean); 

      recommendedJobs = (recommendedIds.recommendedJobIds || []).map(id =>
        jobListings.find(job => job.id === id)
      ).filter(Boolean);
      
      console.log('Found recommended courses:', recommendedCourses.length);
      console.log('Found recommended jobs:', recommendedJobs.length);
    } catch (aiError) {
      console.error("AI recommendation failed, using fallback:", aiError);
      // Fallback: use test generators to ensure we have data
      const testData = testGenerators();
      recommendedCourses = testData.courses;
      recommendedJobs = testData.jobs;
      console.log('Using test generators - courses:', recommendedCourses.length, 'jobs:', recommendedJobs.length);
    }

    const userDocRef = doc(db, 'users', userData.uid);
    await updateDoc(userDocRef, {
      recommendedCourses,
      recommendedJobs,
      analysisComplete: true,
      lastAnalysisDate: new Date(),
    });

    // Ensure we always have some recommendations
    if (recommendedCourses.length === 0 && courseCatalog.length > 0) {
      console.log('No AI courses, using first 3 from catalog');
      recommendedCourses = courseCatalog.slice(0, 3);
    }
    
    if (recommendedJobs.length === 0 && jobListings.length > 0) {
      console.log('No AI jobs, using first 3 from listings');
      recommendedJobs = jobListings.slice(0, 3);
    }
    
    console.log('Final recommendations - courses:', recommendedCourses.length, 'jobs:', recommendedJobs.length);
    console.log('AI analysis and save complete.');
    return { recommendedCourses, recommendedJobs };

  } catch (error) {
    console.error("Error during full AI analysis:", error);
    // ✅ Return empty arrays on failure
    return { recommendedCourses: [], recommendedJobs: [] };
  }
};
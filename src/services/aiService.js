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
  
  const prompt = `
    You are an expert career advisor specializing in the Middle East and North Africa region.
    Analyze the user's profile and select the top 3 courses AND the top 3 jobs that are the best fit.

    USER PROFILE:
    - Career Goal: "${careerGoal}"
    - Employment Status: "${employmentStatus}"
    - Prior Experience: "${experience}"
    - University: "${university}"
    - Field Experience: "${fieldExperienceStr}"
    - Desired Work Fields: "${desiredFieldStr}"
    - Dream Job: "${dreamJob}"
    - Remote Work Countries: "${remoteCountries.join(', ')}"

    AVAILABLE COURSES (with their IDs):
    ---
    ${JSON.stringify(courseCatalog.map(c => ({ id: c.id, title: c.title, provider: c.provider, skills: c.skills })))}
    ---

    AVAILABLE JOBS (with their IDs):
    ---
    ${JSON.stringify(jobListings.map(j => ({ id: j.id, title: j.title, company: j.company, category: j.category })))}
    ---

    INSTRUCTIONS:
    Consider the user's background, goals, and regional context (West Bank/Palestine).
    Focus on courses that will help them achieve their career goals and jobs that match their experience level.
    Return a single, valid JSON object with two keys: "recommendedCourseIds" and "recommendedJobIds".
    Each key must contain an array of the top 3 STRING IDs from the respective lists.
    The output must be only the JSON object and nothing else.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedResponse);
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
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { fetchCourses } from './courseService';
import { fetchJobs } from './jobService';

// TODO: Replace with your actual Gemini API Key.
// IMPORTANT: This is not secure for a production app.
const API_KEY = 'AIzaSyAID57D3UKZdSt8Fc-WarY_2rlN4jNAdro';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const getAiRecommendations = async (userData, courseCatalog, jobListings) => {
  console.log('AI Service: Analyzing user profile...');
  const prompt = `
    You are an expert career advisor. Analyze the user's profile, available courses, and available jobs.
    Your task is to select the top 3 courses AND the top 3 jobs that are the best fit.

    USER PROFILE:
    - Goal: "${userData.careerGoal}"
    - Experience: ${userData.experience}
    - Interests: ${userData.field.join(', ')}

    AVAILABLE COURSES (with their IDs):
    ---
    ${JSON.stringify(courseCatalog.map(c => ({ id: c.id, title: c.title })))}
    ---

    AVAILABLE JOBS (with their IDs):
    ---
    ${JSON.stringify(jobListings.map(j => ({ id: j.id, title: j.title })))}
    ---

    INSTRUCTIONS:
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
    const searchKeywords = userData.field?.join(' ') || 'professional development';

    const [courseCatalog, jobListings] = await Promise.all([
      fetchCourses(searchKeywords),
      fetchJobs(searchKeywords)
    ]);

    // ✅ We no longer throw an error if one API fails. We proceed with what we have.
    console.log(`Found ${courseCatalog.length} courses and ${jobListings.length} jobs.`);

    const recommendedIds = await getAiRecommendations(userData, courseCatalog, jobListings);
    
    const recommendedCourses = (recommendedIds.recommendedCourseIds || []).map(id => 
      courseCatalog.find(course => course.id === id)
    ).filter(Boolean); 

    const recommendedJobs = (recommendedIds.recommendedJobIds || []).map(id =>
      jobListings.find(job => job.id === id)
    ).filter(Boolean);

    const userDocRef = doc(db, 'users', userData.uid);
    await updateDoc(userDocRef, {
      recommendedCourses,
      recommendedJobs,
      analysisComplete: true,
      lastAnalysisDate: new Date(),
    });

    console.log('AI analysis and save complete.');
    return { recommendedCourses, recommendedJobs };

  } catch (error) {
    console.error("Error during full AI analysis:", error);
    // ✅ Return empty arrays on failure
    return { recommendedCourses: [], recommendedJobs: [] };
  }
};
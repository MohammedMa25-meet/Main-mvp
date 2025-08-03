import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './firebase'; // Import Firestore database
import { doc, updateDoc } from 'firebase/firestore'; // Import Firestore functions
import { fetchCourses } from './courseService'; // Import your course "Research Agent"
import { fetchJobs } from './jobService'; // Import your job "jobResearch Agent"
// TODO: Replace with your actual Gemini API Key.
// IMPORTANT: This is not secure for a production app. Use a backend for a real product.
const API_KEY = 'AIzaSyAID57D3UKZdSt8Fc-WarY_2rlN4jNAdro';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * The "Matching & Ranking Agent" - now smarter and recommends jobs.
 */
const getAiRecommendations = async (userData, courseCatalog, jobListings) => {
  console.log('AI Service: Analyzing user profile against courses and jobs...');
  const prompt = `
    You are an expert career advisor. Analyze the user's profile, the available courses, and the available jobs.
    Your task is to select the top 3 courses AND the top 3 jobs that are the best fit.
    When looking for jobs, please filter to show only those who are in the Gulf area and that are in the ICT field.
    USER PROFILE:
    - Goal: "${userData.careerGoal}"
    - Experience: ${userData.experience}
    - Interests: ${userData.field.join(', ')}

    AVAILABLE COURSES (pick 3 from this list):
    ---
    ${JSON.stringify(courseCatalog.slice(0, 10))} 
    ---

    AVAILABLE JOBS (pick 3 from this list):
    ---
    ${JSON.stringify(jobListings.slice(0, 10))}
    ---

    INSTRUCTIONS:
    Return a single, valid JSON object with two keys: "recommendedCourses" and "recommendedJobs".
    Each key must contain an array of the top 3 FULL objects from the respective lists.
    The output must be only the JSON object and nothing else.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error('Failed to get recommendations from AI.');
  }
};

/**
 * The "Orchestrator" - now runs the full AI pipeline for both courses AND jobs.
 */
export const runFullAiAnalysis = async (userData) => {
  console.log('Running full AI analysis for user:', userData.uid);
  try {
    const searchKeywords = userData.field?.join(' ') || 'professional development';

    console.log('AI System: Calling Research Agents (Courses & Jobs)...');
    const [courseCatalog, jobListings] = await Promise.all([
      fetchCourses(searchKeywords),
      fetchJobs(searchKeywords)
    ]);

    if (courseCatalog.length === 0 || jobListings.length === 0) {
      throw new Error('Could not find enough information to generate recommendations.');
    }

    console.log('AI System: Calling Matching Agent (Gemini)...');
    const { recommendedCourses, recommendedJobs } = await getAiRecommendations(userData, courseCatalog, jobListings);

    console.log('AI System: Saving new recommendations to Firebase...');
    const userDocRef = doc(db, 'users', userData.uid);
    await updateDoc(userDocRef, {
      recommendedCourses: recommendedCourses || [],
      recommendedJobs: recommendedJobs || [],
      analysisComplete: true,
      lastAnalysisDate: new Date(),
    });

    console.log('AI analysis and save complete.');
    return { recommendedCourses, recommendedJobs };

  } catch (error) {
    console.error("Error during full AI analysis:", error);
    throw error;
  }
};
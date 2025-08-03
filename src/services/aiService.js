import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './firebase'; // Import Firestore database
import { doc, updateDoc } from 'firebase/firestore'; // Import Firestore functions
import { fetchCourses } from './courseService'; // Import your course "Research Agent"

// TODO: Replace with your actual Gemini API Key.
// IMPORTANT: This is not secure for a production app. Use a backend for a real product.
const API_KEY = 'AIzaSyAID57D3UKZdSt8Fc-WarY_2rlN4jNAdro';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * The "Matching & Ranking Agent" - takes user data and courses and gets AI recommendations.
 * @param {object} userData The user's profile data.
 * @param {Array} courseCatalog The list of courses to analyze.
 * @returns {Promise<Array>} A list of recommended course objects.
 */
const getAiRecommendations = async (userData, courseCatalog) => {
  console.log('AI Service: Analyzing user profile...');
  const prompt = `
    You are an expert career advisor for an app called Bridge-It.
    Analyze the following user profile and the provided list of available courses.
    Your task is to select the top 3 courses that are the absolute best fit for this user.

    USER PROFILE:
    - Name: ${userData.firstName} ${userData.lastName}
    - Stated Career Goal: "${userData.careerGoal}"
    - Current Experience Level: ${userData.experience}
    - Fields of Interest: ${userData.field.join(', ')}

    AVAILABLE COURSE CATALOG:
    ---
    ${JSON.stringify(courseCatalog)}
    ---

    INSTRUCTIONS:
    Return ONLY a valid JSON array of the top 3 FULL course objects from the catalog that you recommend.
    The output must be only the JSON array and nothing else.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const recommendedCourses = JSON.parse(cleanedResponse);
    
    console.log('AI Service: Recommendations received successfully.');
    return recommendedCourses;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error('Failed to get recommendations from AI.');
  }
};

/**
 * The "Orchestrator" - runs the full AI analysis pipeline for a user.
 * @param {object} userData The full user data object from your context.
 * @returns {Promise<Array>} A promise that resolves with the new list of recommended courses.
 */
export const runFullAiAnalysis = async (userData) => {
  console.log('Running full AI analysis for user:', userData.uid);
  try {
    // 1. Research Agent: Fetch live courses
    console.log('AI System: Calling Research Agent (Courses)...');
    const searchKeywords = userData.field?.join(' ') || 'professional development';
    const courseCatalog = await fetchCourses(searchKeywords);

    if (!courseCatalog || courseCatalog.length === 0) {
      console.log("No courses found, cannot generate recommendations.");
      return [];
    }

    // 2. Matching Agent: Send data to Gemini AI
    console.log('AI System: Calling Matching Agent (Gemini)...');
    const recommendedCourses = await getAiRecommendations(userData, courseCatalog);

    // 3. Save Results: Update the user's profile in Firestore
    console.log('AI System: Saving new recommendations to Firebase...');
    const userDocRef = doc(db, 'users', userData.uid);
    await updateDoc(userDocRef, {
      recommendedCourses: recommendedCourses,
      analysisComplete: true,
      lastAnalysisDate: new Date(),
    });

    console.log('AI analysis and save complete.');
    return recommendedCourses;

  } catch (error) {
    console.error("Error during full AI analysis:", error);
    throw error;
  }
};

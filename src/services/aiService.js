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

/**
 * NEW "Analyst Agent" - Performs a deep analysis on a single item.
 * @param {object} item - A single course or job object.
 * @param {object} userData - The user's profile data.
 * @returns {Promise<{summary: string, reason: string}>} - The AI-generated analysis.
 */
const getPersonalizedAnalysis = async (item, userData) => {
  const itemType = item.provider ? 'course' : 'job';
  const prompt = `
    You are a career advisor. Analyze the user's profile and the provided ${itemType}.
    Your task is to provide a concise, engaging summary and a personalized reason why this is a good fit for the user.

    USER PROFILE:
    - Goal: "${userData.careerGoal}"
    - Experience: ${userData.experience}
    - Interests: ${userData.field.join(', ')}

    ITEM TO ANALYZE:
    ---
    ${JSON.stringify({ title: item.title, description: item.description })}
    ---

    INSTRUCTIONS:
    Return a single, valid JSON object with two keys: "summary" and "reason".
    - "summary": A one-sentence summary of the ${itemType}.
    - "reason": A personalized, one-sentence explanation of why this ${itemType} is a great match for this specific user.
    The output must be only the JSON object.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error(`AI analysis failed for item ${item.id}:`, error);
    // Return default values if the deep analysis fails
    return { summary: item.description, reason: "This is a popular choice for users with your interests." };
  }
};


/**
 * The "Matching & Ranking Agent" - gets the top recommendations.
 */
const getTopRecommendations = async (userData, courseCatalog, jobListings) => {
  // ... (This function is the same as the "getAiRecommendations" from our previous version that asks for IDs)
  // It returns { recommendedCourseIds: [...], recommendedJobIds: [...] }
};

/**
 * The "Orchestrator" - now with a second "deep analysis" step.
 */
export const runFullAiAnalysis = async (userData) => {
  console.log('Running full AI analysis for user:', userData.uid);
  try {
    const searchKeywords = userData.field?.join(' ') || 'professional development';
    console.log('AI System: Calling Research Agents...');
    const [courseCatalog, jobListings] = await Promise.all([
      fetchCourses(searchKeywords),
      fetchJobs(searchKeywords)
    ]);

    console.log(`Found ${courseCatalog.length} courses and ${jobListings.length} jobs.`);
    if (courseCatalog.length === 0 && jobListings.length === 0) {
      throw new Error('Could not find any courses or jobs to analyze.');
    }

    console.log('AI System: Calling Matching Agent for top recommendations...');
    const recommendedIds = await getTopRecommendations(userData, courseCatalog, jobListings);
    
    const topCourses = (recommendedIds.recommendedCourseIds || []).map(id => courseCatalog.find(c => c.id === id)).filter(Boolean);
    const topJobs = (recommendedIds.recommendedJobIds || []).map(id => jobListings.find(j => j.id === id)).filter(Boolean);

    // ✅ --- NEW DEEP ANALYSIS STEP --- ✅
    console.log('AI System: Performing deep analysis on top recommendations...');
    const courseAnalysisPromises = topCourses.map(course => getPersonalizedAnalysis(course, userData));
    const jobAnalysisPromises = topJobs.map(job => getPersonalizedAnalysis(job, userData));
    
    const courseAnalyses = await Promise.all(courseAnalysisPromises);
    const jobAnalyses = await Promise.all(jobAnalysisPromises);

    // Combine the original data with the new AI-generated summary and reason
    const finalCourses = topCourses.map((course, index) => ({ ...course, ...courseAnalyses[index] }));
    const finalJobs = topJobs.map((job, index) => ({ ...job, ...jobAnalyses[index] }));

    console.log('AI System: Saving new, personalized recommendations to Firebase...');
    const userDocRef = doc(db, 'users', userData.uid);
    await updateDoc(userDocRef, {
      recommendedCourses: finalCourses,
      recommendedJobs: finalJobs,
      analysisComplete: true,
      lastAnalysisDate: new Date(),
    });

    console.log('AI analysis and save complete.');
    return { recommendedCourses: finalCourses, recommendedJobs: finalJobs };

  } catch (error) {
    console.error("Error during full AI analysis:", error);
    return { recommendedCourses: [], recommendedJobs: [] };
  }
};
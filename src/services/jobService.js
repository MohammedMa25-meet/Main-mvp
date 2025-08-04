// src/services/jobService.js

// TODO: Replace with your actual key from RapidAPI
const JSEARCH_API_KEY = 'ce730dd6c4mshfc23865116522b3p13e9bbjsn7f26457d877f';

const JSEARCH_API_HOST = 'jsearch.p.rapidapi.com';

/**
 * Searches for jobs using the Jsearch API with specific parameters.
 * @param {string} searchKeywords - The job title or keywords to search for.
 * @returns {Promise<Array>} - A promise that resolves with a list of job objects.
 */
export const fetchJobs = async (searchKeywords) => {
  console.log(`Job Service: Searching for jobs related to "${searchKeywords}" in Gulf & Remote...`);
  
  // ✅ --- THIS IS THE FIX --- ✅
  // We've updated the query to be more specific and added 'remote_jobs_only'.
  const query = `${searchKeywords} in UAE, Saudi Arabia, Qatar, Kuwait, Oman, Bahrain`;
  const apiUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&remote_jobs_only=true`;

  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': JSEARCH_API_KEY,
      'X-RapidAPI-Host': JSEARCH_API_HOST
    }
  };

  try {
    const response = await fetch(apiUrl, options);
    if (!response.ok) {
      throw new Error(`Jsearch API responded with status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      console.warn("Jsearch API did not return valid job data.");
      return [];
    }

    // The data mapping remains the same
    const jobs = data.data.map(job => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name || 'N/A',
      location: job.job_city ? `${job.job_city}, ${job.job_country}` : 'Remote',
      description: job.job_description || 'No description provided.',
      image: job.employer_logo,
      job_url: job.job_apply_link,
      workType: job.job_employment_type || 'Full-time',
      // ... other fields
    }));
    
    return jobs;

  } catch (error) {
    console.error("Failed to fetch from Jsearch API:", error);
    return [];
  }
};
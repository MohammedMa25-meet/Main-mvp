// src/services/jobService.js

// TODO: Replace with your actual key from RapidAPI
const JSEARCH_API_KEY = 'ce730dd6c4mshfc23865116522b3p13e9bbjsn7f26457d877f';

const JSEARCH_API_HOST = 'jsearch.p.rapidapi.com';

/**
 * Searches for jobs using the Jsearch API.
 * @param {string} searchKeywords - The job title or keywords to search for.
 * @returns {Promise<Array>} - A promise that resolves with a list of job objects.
 */
export const fetchJobs = async (searchKeywords) => {
  console.log(`Job Service: Searching for jobs related to "${searchKeywords}"...`);
  // We will search for jobs in the Middle East, you can change the country codes
  const apiUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchKeywords)}&location=AE,SA,QA,KW,OM,BH`;

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

    // Clean up the job data into a format our app can use
    const jobs = data.data.map(job => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country,
      description: job.job_description,
      image: job.employer_logo,
      job_url: job.job_apply_link,
    }));

    return jobs;

  } catch (error) {
    console.error("Failed to fetch from Jsearch API:", error);
    return [];
  }
};
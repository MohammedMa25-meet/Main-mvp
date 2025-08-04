// This function generates a random, beautiful placeholder image URL
const getPlaceholderImage = (keywords) => {
  const firstKeyword = keywords.split(' ')[0];
  return `https://source.unsplash.com/400x300/?${firstKeyword},technology`;
};

/**
 * Fetches real course data from a new, stable, free course API.
 * @param {string} searchKeywords - The keywords to search for.
 * @returns {Promise<Array>} - A promise that resolves with a list of course objects.
 */
export const fetchCourses = async (searchKeywords) => {
  console.log(`Course Service: Searching for real courses about "${searchKeywords}"...`);
  // ✅ This is a new, reliable, free API for course data
  const apiUrl = `https://test-api.classpert.com/v1/courses?query=${encodeURIComponent(searchKeywords)}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Course API responded with status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.courses || !Array.isArray(data.courses)) {
      console.warn("Course API did not return a valid 'courses' array.");
      return [];
    }
    
    // Clean up the data into the format our app expects
    const courses = data.courses.map(course => ({
      id: course._id, // Use the unique ID from the API
      title: course.title,
      provider: course.creators || 'Online Platform',
      description: `A course on ${course.title}.`, // The API doesn't provide descriptions, so we create one.
      image: getPlaceholderImage(searchKeywords), // The API doesn't provide images
      level: course.level || 'All Levels',
      duration: course.duration ? `${Math.round(course.duration / 3600)} hours` : 'Self-paced',
      course_url: course.url,
    }));
    
    return courses;

  } catch (error) {
    console.error("Failed to fetch from Course API:", error);
    return [];
  }
};
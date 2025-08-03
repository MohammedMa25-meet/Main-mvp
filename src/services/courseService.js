// This function generates a random, beautiful placeholder image URL
const getPlaceholderImage = (keywords) => {
  const firstKeyword = keywords.split(' ')[0];
  return `https://source.unsplash.com/400x300/?${firstKeyword},technology`;
};

/**
 * Fetches real course data from a free, public course API.
 * @param {string} searchKeywords - The keywords to search for.
 * @returns {Promise<Array>} - A promise that resolves with a list of course objects.
 */
export const fetchCourses = async (searchKeywords) => {
  console.log(`Course Service: Searching for real courses about "${searchKeywords}"...`);
  // ✅ This is a free, public API specifically for courses
  const apiUrl = `https://raw.githubusercontent.com/srikanth-gde/GDE-Course-API/main/src/data/courses.json`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Course API responded with status: ${response.status}`);
    }
    const allCourses = await response.json();

    // Filter the courses based on the search keywords
    const keywords = searchKeywords.toLowerCase().split(' ');
    const filteredCourses = allCourses.filter(course => 
      keywords.some(keyword => course.title.toLowerCase().includes(keyword) || course.description.toLowerCase().includes(keyword))
    );

    // Clean up the data into the format our app expects
    const courses = filteredCourses.map(course => ({
      id: course.id,
      title: course.title,
      provider: course.author,
      description: course.description,
      image: course.image || getPlaceholderImage(searchKeywords),
      level: course.level,
      duration: `${course.duration} hours`,
      course_url: course.url,
    }));
    
    // If no courses match, return a few general ones
    if (courses.length === 0) {
        return allCourses.slice(0, 5).map(c => ({...c, id: c.id}));
    }

    return courses;

  } catch (error) {
    console.error("Failed to fetch from Course API:", error);
    return [];
  }
};
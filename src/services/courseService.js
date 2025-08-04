// This function generates a random, beautiful placeholder image URL
const getPlaceholderImage = (keywords) => {
  const firstKeyword = keywords.split(' ')[0];
  return `https://source.unsplash.com/400x300/?${firstKeyword},technology`;
};

/**
 * Fetches real course data from the Microsoft Learn Catalog API.
 * @param {string} searchKeywords - The keywords to search for.
 * @returns {Promise<Array>} - A promise that resolves with a list of course objects.
 */
export const fetchCourses = async (searchKeywords = '') => {
  try {
    const baseUrl = 'https://learn.microsoft.com/api/catalog/';
    const params = new URLSearchParams({
      locale: 'en-us',
      type: 'modules,learningPaths',
      '$top': '100' // Request up to 100 items from the API
    });

    console.log(`🔍 Fetching courses for: "${searchKeywords}"`);
    const response = await fetch(`${baseUrl}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Catalog API failed with status ${response.status}`);
    }

    const catalogData = await response.json();

    const allCoursesArray = [
      ...(catalogData.modules || []),
      ...(catalogData.learningPaths || [])
    ];

    const keywords = searchKeywords.toLowerCase().split(' ').filter(Boolean);

    // Filter the full list of courses based on the user's interests
    const filteredCourses = allCoursesArray.filter(item =>
      keywords.length === 0 ||
      keywords.some(kw =>
        (item.title || '').toLowerCase().includes(kw) ||
        (item.summary || '').toLowerCase().includes(kw) ||
        (item.roles || []).join(' ').toLowerCase().includes(kw)
      )
    );

    // Map the filtered data to the clean format our app uses
    return filteredCourses.map(item => ({
      id: item.uid,
      title: item.title,
      provider: 'Microsoft Learn',
      description: item.summary || 'No description available',
      image: item.icon_url || getPlaceholderImage(searchKeywords || 'tech'),
      level: (item.levels || []).join(', ') || 'All Levels',
      duration: '', // Duration is not available in this API
      course_url: `https://learn.microsoft.com${item.url}`
    }));

  } catch (error) {
    console.error('❌ Error fetching courses:', error.message);
    return []; // Return an empty array on error
  }
};
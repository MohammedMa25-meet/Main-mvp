// src/services/courseService.js

// This function generates a placeholder if the API doesn't provide an image
const getPlaceholderImage = (keywords) => {
  const firstKeyword = keywords.split(' ')[0];
  return `https://source.unsplash.com/400x300/?${firstKeyword},book`;
};

export const fetchCourses = async (searchKeywords) => {
  console.log(`Searching for courses about: "${searchKeywords}"`);
  // ✅ Using the Google Books API - it's free and has relevant content
  const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchKeywords)}&maxResults=10`;

  try {
    const response = await fetch(googleBooksApiUrl);
    if (!response.ok) {
      throw new Error(`Google Books API responded with status: ${response.status}`);
    }
    
    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
      console.warn("API did not return any items.");
      return [];
    }

    // ✅ Transform the 'book' data into the 'course' format our app expects
    const courses = data.items.map((item) => {
      const bookInfo = item.volumeInfo;
      return {
        id: item.id,
        title: bookInfo.title || 'No Title Available',
        provider: bookInfo.authors ? bookInfo.authors.join(', ') : 'Various Authors',
        description: bookInfo.description || 'No description available.',
        image: bookInfo.imageLinks?.thumbnail || getPlaceholderImage(searchKeywords),
        price: bookInfo.saleInfo?.listPrice?.amount ? `$${bookInfo.saleInfo.listPrice.amount}` : 'Varies',
        level: bookInfo.maturityRating === 'NOT_MATURE' ? 'All Levels' : 'Advanced',
        duration: bookInfo.pageCount ? `${bookInfo.pageCount} pages` : 'Self-paced',
      };
    });

    return courses;
  } catch (error) {
    console.error("Failed to fetch from API:", error);
    return [];
  }
};
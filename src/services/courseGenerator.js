// Course Generator Service - Translates Python logic to JavaScript
// This generates courses similar to the Python code provided

const universities = [
  'MIT', 'Columbia', 'Harvard', 'Stanford', 'Yale', 'Princeton', 
  'Berkeley', 'Cornell', 'Oxford', 'Cambridge'
];

const courseTopics = [
  {
    title: 'Introduction to Artificial Intelligence',
    skills: ['Machine Learning', 'Python', 'Neural Networks', 'Data Analysis']
  },
  {
    title: 'Basics of Digital Marketing',
    skills: ['SEO', 'Social Media', 'Content Marketing', 'Analytics']
  },
  {
    title: 'Fundamentals of Cybersecurity',
    skills: ['Encryption', 'Network Security', 'Risk Management', 'Incident Response']
  },
  {
    title: 'Web Development Bootcamp',
    skills: ['HTML', 'CSS', 'JavaScript', 'React']
  },
  {
    title: 'Data Science Essentials',
    skills: ['R', 'Python', 'Statistics', 'Data Visualization']
  },
  {
    title: 'Creative Writing Workshop',
    skills: ['Storytelling', 'Editing', 'Poetry', 'Fiction Writing']
  },
  {
    title: 'Project Management Basics',
    skills: ['Agile', 'Scrum', 'Risk Management', 'Scheduling']
  },
  {
    title: 'UX/UI Design Principles',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping']
  },
  {
    title: 'Introduction to Philosophy',
    skills: ['Critical Thinking', 'Logic', 'Ethics', 'Philosophical Analysis']
  },
  {
    title: 'Basics of Financial Accounting',
    skills: ['Bookkeeping', 'Balance Sheets', 'Income Statements', 'Budgeting']
  },
  {
    title: 'Entrepreneurship Fundamentals',
    skills: ['Business Planning', 'Pitching', 'Market Research', 'Startup Growth']
  },
  {
    title: 'Photography for Beginners',
    skills: ['Composition', 'Lighting', 'Editing', 'DSLR usage']
  },
  {
    title: 'Blockchain & Cryptocurrency',
    skills: ['Blockchain', 'Ethereum', 'Cryptography', 'Smart Contracts']
  },
  {
    title: 'Introduction to Robotics',
    skills: ['Robotics', 'Arduino', 'Automation', 'Programming']
  },
  {
    title: 'Graphic Design Essentials',
    skills: ['Photoshop', 'Illustrator', 'Typography', 'Visual Branding']
  },
  {
    title: 'Advanced Excel Techniques',
    skills: ['Pivot Tables', 'Macros', 'Data Analysis', 'Visualization']
  },
  {
    title: 'Cloud Computing Basics',
    skills: ['AWS', 'Azure', 'Cloud Architecture', 'Deployment']
  },
  {
    title: 'Human Psychology 101',
    skills: ['Cognitive Psychology', 'Behavior Analysis', 'Therapy Basics', 'Research Methods']
  },
  {
    title: 'Basics of Music Production',
    skills: ['Logic Pro', 'Ableton', 'Mixing', 'Audio Engineering']
  },
  {
    title: 'Renewable Energy Introduction',
    skills: ['Solar Power', 'Wind Energy', 'Sustainability', 'Energy Policy']
  }
];

const softSkillTopics = [
  {
    title: 'Effective Communication',
    skills: ['Listening', 'Clarity', 'Empathy', 'Persuasion']
  },
  {
    title: 'Time Management Mastery',
    skills: ['Prioritization', 'Scheduling', 'Efficiency', 'Goal Setting']
  },
  {
    title: 'Leadership Essentials',
    skills: ['Decision Making', 'Team Management', 'Motivation', 'Delegation']
  },
  {
    title: 'Conflict Resolution',
    skills: ['Negotiation', 'Problem Solving', 'Mediation', 'Listening']
  },
  {
    title: 'Emotional Intelligence',
    skills: ['Self-Awareness', 'Empathy', 'Self-Regulation', 'Social Skills']
  },
  {
    title: 'Public Speaking Confidence',
    skills: ['Presentation Skills', 'Speech Writing', 'Audience Engagement', 'Storytelling']
  },
  {
    title: 'Teamwork & Collaboration',
    skills: ['Collaboration', 'Communication', 'Team Building', 'Conflict Management']
  },
  {
    title: 'Critical Thinking Skills',
    skills: ['Analysis', 'Problem Solving', 'Logic', 'Evaluation']
  },
  {
    title: 'Adaptability & Resilience',
    skills: ['Stress Management', 'Flexibility', 'Problem Solving', 'Growth Mindset']
  },
  {
    title: 'Networking for Success',
    skills: ['Relationship Building', 'Personal Branding', 'Communication', 'Confidence']
  },
  {
    title: 'Customer Service Excellence',
    skills: ['Active Listening', 'Empathy', 'Problem Solving', 'Communication']
  },
  {
    title: 'Negotiation Techniques',
    skills: ['Strategy', 'Persuasion', 'Communication', 'Conflict Resolution']
  },
  {
    title: 'Creative Problem Solving',
    skills: ['Innovation', 'Brainstorming', 'Analysis', 'Idea Development']
  },
  {
    title: 'Personal Branding',
    skills: ['Social Media', 'Networking', 'Presentation', 'Confidence']
  },
  {
    title: 'Career Development',
    skills: ['Goal Setting', 'Networking', 'Resume Writing', 'Interviewing']
  },
  {
    title: 'Stress Management',
    skills: ['Relaxation Techniques', 'Time Management', 'Mindfulness', 'Resilience']
  },
  {
    title: 'Cross-Cultural Communication',
    skills: ['Cultural Awareness', 'Listening', 'Empathy', 'Adaptability']
  },
  {
    title: 'Decision-Making Skills',
    skills: ['Analysis', 'Critical Thinking', 'Judgment', 'Problem Solving']
  },
  {
    title: 'Building Confidence',
    skills: ['Self-esteem', 'Public Speaking', 'Assertiveness', 'Personal Development']
  },
  {
    title: 'Work-Life Balance',
    skills: ['Time Management', 'Prioritization', 'Self-Care', 'Mindfulness']
  }
];

const randomDescription = (topic) => {
  const templates = [
    `Gain foundational knowledge in ${topic} through interactive sessions, practical exercises, and real-world projects guided by industry experts, suitable for beginners aiming to expand their skill set.`,
    `This introductory course covers the essentials of ${topic}, combining theory and hands-on experience to build confidence and competence for further exploration or career advancement.`,
    `Designed for those new to ${topic}, this course provides comprehensive lessons, expert guidance, and practical applications to ensure immediate skill enhancement and professional growth.`,
    `Explore fundamental concepts of ${topic} with structured lectures, collaborative assignments, and case studies that equip learners with essential skills and practical insights.`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

const getRandomSkills = (skillsPool, count) => {
  const shuffled = [...skillsPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, skillsPool.length));
};

const generateCourses = (count, topicList) => {
  const courses = [];
  const usedTitles = new Set(); // Track used titles to avoid duplicates
  
  for (let i = 0; i < count; i++) {
    const uni = universities[Math.floor(Math.random() * universities.length)];
    const topic = topicList[Math.floor(Math.random() * topicList.length)];
    
    // Create variations of the course title to make them unique
    let name = topic.title;
    let variation = 1;
    
    // If title already used, add a variation
    while (usedTitles.has(name)) {
      const variations = [
        `${topic.title} - Advanced Level`,
        `${topic.title} - Professional Edition`,
        `${topic.title} - Complete Guide`,
        `${topic.title} - Masterclass`,
        `${topic.title} - Expert Series`,
        `${topic.title} - Comprehensive Course`,
        `${topic.title} - Specialized Training`,
        `${topic.title} - Industry Focus`,
        `${topic.title} - Practical Workshop`,
        `${topic.title} - Intensive Program`
      ];
      name = variations[Math.floor(Math.random() * variations.length)];
      variation++;
      
      // If we've tried too many variations, add a random suffix
      if (variation > 10) {
        const suffixes = ['Pro', 'Plus', 'Elite', 'Premium', 'Advanced', 'Expert', 'Master', 'Specialist'];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        name = `${topic.title} ${suffix}`;
        break;
      }
    }
    
    usedTitles.add(name);
    const description = randomDescription(topic.title);
    const price = Math.floor(Math.random() * (600 - 70 + 1)) + 70;
    const lengthWeeks = Math.floor(Math.random() * 12) + 1;
    const length = `${lengthWeeks} weeks`;
    const skills = getRandomSkills(topic.skills, Math.floor(Math.random() * 4) + 2);
    
    courses.push({
      id: `course_${Date.now()}_${i}`,
      title: name,
      provider: uni,
      description: description,
      image: `https://source.unsplash.com/400x300/?${topic.title.split(' ')[0]},technology`,
      level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
      duration: length,
      price: price,
      skills: skills.join(', '),
      course_url: `https://example.com/course/${name.toLowerCase().replace(/\s+/g, '-')}`
    });
  }
  return courses;
};

export const generateCourseCatalog = () => {
  // Generate 1000 technical and 1000 soft-skill courses (total 2000)
  const technicalCourses = generateCourses(1000, courseTopics);
  const softSkillCourses = generateCourses(1000, softSkillTopics);
  
  // Combine both lists
  const allCourses = [...technicalCourses, ...softSkillCourses];
  
  // Shuffle the array to mix technical and soft skill courses
  return allCourses.sort(() => 0.5 - Math.random());
};

export const getCoursesByCategory = (category) => {
  const allCourses = generateCourseCatalog();
  
  if (category === 'technical') {
    return allCourses.filter(course => 
      courseTopics.some(topic => topic.title === course.title)
    );
  } else if (category === 'soft-skills') {
    return allCourses.filter(course => 
      softSkillTopics.some(topic => topic.title === course.title)
    );
  }
  
  return allCourses;
};

export const searchCourses = (searchTerm) => {
  const allCourses = generateCourseCatalog();
  const searchLower = searchTerm.toLowerCase();
  
  return allCourses.filter(course => 
    course.title.toLowerCase().includes(searchLower) ||
    course.description.toLowerCase().includes(searchLower) ||
    course.skills.toLowerCase().includes(searchLower) ||
    course.provider.toLowerCase().includes(searchLower)
  );
}; 
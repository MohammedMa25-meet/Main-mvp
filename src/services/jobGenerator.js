// Job Generator Service - Provides fallback job data
// This generates jobs similar to real job listings

const companies = [
  'TechCorp Middle East',
  'Digital Solutions Arabia',
  'Innovation Hub Qatar',
  'Smart Systems Kuwait',
  'Future Tech UAE',
  'Digital Dynamics Bahrain',
  'TechVision Oman',
  'Innovation Labs Saudi',
  'Digital Bridge Palestine',
  'TechConnect Jordan'
];

const jobTitles = [
  'Software Developer',
  'Data Analyst',
  'Cybersecurity Specialist',
  'UI/UX Designer',
  'Project Manager',
  'Business Analyst',
  'Network Administrator',
  'Mobile App Developer',
  'Cloud Engineer',
  'DevOps Engineer',
  'AI/ML Engineer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Database Administrator',
  'IT Consultant',
  'System Administrator',
  'Quality Assurance Engineer',
  'Product Manager',
  'Technical Lead'
];

const locations = [
  'Dubai, UAE',
  'Riyadh, Saudi Arabia',
  'Doha, Qatar',
  'Kuwait City, Kuwait',
  'Muscat, Oman',
  'Manama, Bahrain',
  'Amman, Jordan',
  'Ramallah, Palestine',
  'Abu Dhabi, UAE',
  'Jeddah, Saudi Arabia'
];

const jobDescriptions = [
  'Join our dynamic team to develop innovative software solutions for the Middle East market. Experience with modern technologies and agile methodologies required.',
  'Analyze complex data sets to provide actionable insights for business growth. Strong analytical skills and experience with data visualization tools needed.',
  'Protect our digital infrastructure and implement security best practices. Experience with cybersecurity frameworks and threat detection required.',
  'Create intuitive and beautiful user experiences for web and mobile applications. Strong portfolio and experience with design tools essential.',
  'Lead cross-functional teams to deliver high-quality software projects on time and within budget. PMP certification preferred.',
  'Bridge the gap between business needs and technical solutions. Strong communication skills and business acumen required.',
  'Maintain and optimize network infrastructure for optimal performance and security. CCNA certification preferred.',
  'Develop cutting-edge mobile applications for iOS and Android platforms. Experience with React Native or Flutter required.',
  'Design and implement cloud-based solutions using AWS, Azure, or Google Cloud. Cloud certifications preferred.',
  'Automate deployment processes and maintain CI/CD pipelines. Experience with Docker and Kubernetes required.'
];

const generateRandomJob = (index) => {
  const company = companies[Math.floor(Math.random() * companies.length)];
  let title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const description = jobDescriptions[Math.floor(Math.random() * jobDescriptions.length)];
  const salary = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
  const workType = ['Remote', 'On-site', 'Hybrid'][Math.floor(Math.random() * 3)];
  const level = ['Entry Level', 'Mid Level', 'Senior Level'][Math.floor(Math.random() * 3)];
  const category = ['Technology', 'Data Science', 'Cybersecurity', 'Design', 'Management'][Math.floor(Math.random() * 5)];

  // Add variations to job titles to make them more diverse
  const titleVariations = [
    `${title}`,
    `${title} Specialist`,
    `${title} Engineer`,
    `${title} Developer`,
    `${title} Analyst`,
    `${title} Consultant`,
    `${title} Manager`,
    `${title} Lead`,
    `${title} Coordinator`,
    `${title} Administrator`
  ];
  
  title = titleVariations[Math.floor(Math.random() * titleVariations.length)];

  return {
    id: `job_${Date.now()}_${index}`,
    title: title,
    company: company,
    location: location,
    description: description,
    salary: `$${salary.toLocaleString()}`,
    workType: workType,
    level: level,
    category: category,
    image: `https://source.unsplash.com/400x400/?${company.split(' ')[0]},logo`,
    job_url: `https://example.com/jobs/${title.toLowerCase().replace(/\s+/g, '-')}`,
  };
};

export const generateJobCatalog = () => {
  const jobs = [];
  for (let i = 0; i < 50; i++) {
    jobs.push(generateRandomJob(i));
  }
  return jobs;
};

export const searchJobs = (searchTerm) => {
  const allJobs = generateJobCatalog();
  const searchLower = searchTerm.toLowerCase();
  
  return allJobs.filter(job => 
    job.title.toLowerCase().includes(searchLower) ||
    job.company.toLowerCase().includes(searchLower) ||
    job.description.toLowerCase().includes(searchLower) ||
    job.category.toLowerCase().includes(searchLower)
  );
};

export const getJobsByCategory = (category) => {
  const allJobs = generateJobCatalog();
  return allJobs.filter(job => job.category === category);
}; 
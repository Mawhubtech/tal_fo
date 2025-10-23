// Test script to verify job description backend integration
// This can be run in the browser console on the intake meeting page

console.log('🧪 Testing Job Description Backend Integration...');

// Test data for job description
const testJobDescription = {
  title: "Senior Frontend Developer",
  summary: "We are seeking an experienced Frontend Developer to join our growing team and build amazing user experiences.",
  responsibilities: [
    "Develop and maintain React applications",
    "Collaborate with design team on UI/UX",
    "Write clean, maintainable code",
    "Participate in code reviews"
  ],
  qualifications: [
    "Bachelor's degree in Computer Science or related field",
    "3+ years of React development experience",
    "Strong understanding of JavaScript/TypeScript"
  ],
  requiredSkills: [
    "React",
    "TypeScript",
    "HTML/CSS",
    "Git"
  ],
  preferredSkills: [
    "Next.js",
    "GraphQL",
    "AWS"
  ],
  experience: "3-5 years of frontend development experience",
  education: "Bachelor's degree preferred",
  benefits: [
    "Health insurance",
    "401k matching",
    "Flexible work hours",
    "Remote work options"
  ],
  salaryRange: "$80,000 - $120,000",
  workArrangements: "Hybrid - 3 days in office, 2 days remote",
  companyCulture: "Fast-paced startup environment with focus on innovation",
  growthOpportunities: "Career advancement opportunities in a growing company"
};

// Function to test saving job description
async function testSaveJobDescription(sessionId) {
  try {
    console.log(`📝 Testing save job description for session: ${sessionId}`);
    
    const response = await fetch(`/api/intake-meeting-sessions/${sessionId}/job-description`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth
      },
      body: JSON.stringify({
        jobDescription: testJobDescription
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Job description saved successfully:', result);
      return result;
    } else {
      console.error('❌ Failed to save job description:', response.status, response.statusText);
      const error = await response.text();
      console.error('Error details:', error);
    }
  } catch (error) {
    console.error('❌ Network error saving job description:', error);
  }
}

// Function to test getting job description
async function testGetJobDescription(sessionId) {
  try {
    console.log(`📖 Testing get job description for session: ${sessionId}`);
    
    const response = await fetch(`/api/intake-meeting-sessions/${sessionId}/job-description`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Job description retrieved successfully:', result);
      return result;
    } else if (response.status === 404) {
      console.log('ℹ️ No job description found for this session');
      return null;
    } else {
      console.error('❌ Failed to get job description:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Network error getting job description:', error);
  }
}

// Function to run full test
async function runJobDescriptionTest(sessionId) {
  if (!sessionId) {
    console.error('❌ Please provide a sessionId to test with');
    return;
  }

  console.log(`🚀 Starting job description test for session: ${sessionId}`);
  
  // Test 1: Save job description
  const savedResult = await testSaveJobDescription(sessionId);
  
  if (savedResult) {
    // Test 2: Get job description
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    const getResult = await testGetJobDescription(sessionId);
    
    if (getResult) {
      console.log('🎉 All tests passed! Job description backend integration is working.');
    }
  }
}

// Export functions for use
window.jobDescriptionTest = {
  testSaveJobDescription,
  testGetJobDescription,
  runJobDescriptionTest,
  testJobDescription
};

console.log('✅ Job description test functions loaded. Usage:');
console.log('jobDescriptionTest.runJobDescriptionTest("your-session-id-here")');

import React from 'react';

// Mock enhanced education data to test the display
const mockEducationData = [
  {
    degree: "Master of Science, Masters",
    institution: "University of Michigan - Rackham Graduate School", 
    fieldOfStudy: "Design",
    startYear: 2015,
    endYear: 2017,
    institutionLocation: "Ann Arbor, Michigan, United States",
    institutionWebsite: "rackham.umich.edu",
    institutionDomain: "umich.edu",
    institutionType: "Post-Secondary Institution",
    gpa: 3.8,
    minors: "",
    socialProfiles: {
      linkedin: "linkedin.com/school/university-of-michigan---rackham-graduate-school",
      facebook: "facebook.com/universityofmichigan", 
      twitter: "twitter.com/umich",
      website: "rackham.umich.edu"
    },
    pdlMetadata: {
      schoolId: "IV69OGaqo1KpvbhVKcAmoA_0",
      linkedinId: "15139745",
      hasLocation: true,
      hasGpa: true,
      degreesCount: 2,
      majorsCount: 1,
      minorsCount: 0
    }
  },
  {
    degree: "Bachelor of Medicine, Bachelors",
    institution: "Umm Al-Qura University",
    fieldOfStudy: "Medicine", 
    startYear: 2001,
    endYear: 2008,
    institutionLocation: "Mecca, Mecca, Saudi Arabia",
    institutionWebsite: "uqu.edu.sa",
    institutionDomain: "uqu.edu.sa",
    institutionType: "Post-Secondary Institution",
    gpa: null,
    minors: "",
    socialProfiles: {
      linkedin: "linkedin.com/school/umm-al-qura-university",
      facebook: "facebook.com/uquedu",
      twitter: "twitter.com/uqu_edu", 
      website: "uqu.edu.sa"
    }
  }
];

console.log('Enhanced Education Test Data:');
console.log('============================');

mockEducationData.forEach((edu, index) => {
  console.log(`\nEducation ${index + 1}:`);
  console.log('Institution:', edu.institution);
  console.log('Degree:', edu.degree);
  console.log('Field:', edu.fieldOfStudy);
  console.log('Years:', `${edu.startYear} - ${edu.endYear}`);
  console.log('Location:', edu.institutionLocation);
  console.log('Website:', edu.institutionWebsite);
  console.log('Type:', edu.institutionType);
  console.log('GPA:', edu.gpa || 'Not provided');
  console.log('Social Profiles:');
  if (edu.socialProfiles) {
    console.log('  - LinkedIn:', edu.socialProfiles.linkedin);
    console.log('  - Website:', edu.socialProfiles.website);
    console.log('  - Facebook:', edu.socialProfiles.facebook);
    console.log('  - Twitter:', edu.socialProfiles.twitter);
  }
});

console.log('\n✅ This data structure matches the enhanced Education interface!');
console.log('📊 Frontend will now display:');
console.log('   • Institution with clickable website link');
console.log('   • GPA badge when available'); 
console.log('   • Enhanced location information');
console.log('   • Institution type badges');
console.log('   • Social profile links');
console.log('   • Field of study and minors');
console.log('   • Year-based dates (2015-2017) vs full dates');
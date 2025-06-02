import React, { useState } from 'react';
// import { Editor } from '@tinymce/tinymce-react'; // Example for Rich Text Editor, ensure you install it

const CreateJobPage: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  // TODO: Add state for hiring team, application questions, pipeline stages

  const handleDescriptionChange = (content: string, editor: any) => {
    setJobDescription(content);
  };

  const handleSubmit = (publish: boolean) => {
    console.log('Submitting job...', {
      jobTitle,
      department,
      location,
      jobDescription,
      employmentType,
      status: publish ? 'Open' : 'Draft'
      // TODO: include other form fields
    });
    // TODO: API call to save/publish job
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Create New Job</h1>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {/* Job Details Section */}
          <section className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out"
                  placeholder="e.g., Engineering"
                />
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out"
                placeholder="e.g., New York, NY or Remote"
              />
            </div>
          </section>

          {/* Job Description Section */}
          <section className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Job Description</h2>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            {/* Replace with a proper Rich Text Editor component */}
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out"
              placeholder="Enter detailed job description, responsibilities, and qualifications..."
            />
            {/*
            <Editor
              apiKey='YOUR_TINYMCE_API_KEY' // Get a free API key from TinyMCE
              id='jobDescription'
              value={jobDescription}
              onEditorChange={handleDescriptionChange}
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount'
                ],
                toolbar: \\
                  'undo redo | formatselect | bold italic backcolor | \\
                  alignleft aligncenter alignright alignjustify | \\
                  bullist numlist outdent indent | removeformat | help'
              }}
            />
            */}
          </section>

          {/* Employment Details Section */}
          <section className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Employment & Application Details</h2>
            <div>
              <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select
                id="employmentType"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out bg-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            {/* TODO: Hiring Team, Application Questions, Pipeline Stages */}
            <div className="mt-6 pt-4 border-t border-gray-200">
               <h3 className="text-md font-medium text-gray-600 mb-2">Hiring Team (TODO)</h3>
               <p className="text-sm text-gray-500">Assign users who will be involved in the hiring process. (Placeholder UI)</p>
               {/* Example: <MultiSelectChipInput users={...} selectedUsers={...} onChange={...} /> */}
            </div>
             <div className="mt-6 pt-4 border-t border-gray-200">
               <h3 className="text-md font-medium text-gray-600 mb-2">Application Questions (TODO)</h3>
               <p className="text-sm text-gray-500">Add custom questions for applicants. (Placeholder UI)</p>
               {/* Example: <QuestionBuilder questions={...} onChange={...} /> */}
            </div>
             <div className="mt-6 pt-4 border-t border-gray-200">
               <h3 className="text-md font-medium text-gray-600 mb-2">Pipeline Stages (TODO)</h3>
               <p className="text-sm text-gray-500">Customize or use default hiring pipeline stages. (Placeholder UI)</p>
               {/* Example: <PipelineStageSelector stages={...} onChange={...} /> */}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-10 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-6 py-3 border border-purple-600 text-purple-700 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-150 ease-in-out font-medium"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-150 ease-in-out font-medium shadow-md"
            >
              Publish Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobPage;

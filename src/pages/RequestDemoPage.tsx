import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 

const RequestDemoPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    companyEmail: '',
    howDidYouHear: '',
    type: '',
    numEmployees: '',
    hqLocation: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement demo request submission logic
    console.log('Demo request submitted:', formData);
    alert('Demo request submitted! We will get back to you soon.');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto"> 
            <div className="mb-10"> 
              <Link to="/" className="flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
                <ArrowLeft size={16} className="mr-1.5" />
                Back to Home
              </Link>
            </div>

            <div className="bg-white shadow-2xl rounded-xl overflow-hidden"> 
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left Column: Content */}
                <div className="p-10 md:p-14 bg-slate-50 flex flex-col justify-center"> 
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5 leading-tight"> 
                    Elevate Your Hiring with <span className="text-purple-600">Tal's AI</span>.
                  </h1>
                  <p className="text-lg text-gray-700 mb-8"> 
                    Stop juggling countless tools. Start building your dream team, intelligently.
                  </p>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Tal isn't just another tool; it's your <span className="font-semibold text-purple-700">unified Talent Intelligence command center</span>. We've fused cutting-edge AI with a comprehensive suite of features—from smart sourcing and automated screening to intuitive ATS and proactive candidate engagement.
                  </p>
                  <ul className="space-y-3 text-gray-600 mb-10"> 
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2.5 mt-0.5 flex-shrink-0" />
                      <span>Streamline complex workflows into simple, automated processes.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2.5 mt-0.5 flex-shrink-0" />
                      <span>Reduce hiring costs by consolidating your tech stack.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2.5 mt-0.5 flex-shrink-0" />
                      <span>Boost recruitment performance with AI-driven insights and efficiency.</span>
                    </li>
                  </ul>
                  
                  {/* Video Placeholder */}
                  <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                    <iframe 
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with actual demo video URL
                      title="Tal Demo Video" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-3">
                    Discover the Future of Hiring with Tal
                  </p>
                </div>

                {/* Right Column: Form */}
                <div className="p-10 md:p-14"> 
                  <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center md:text-left"> 
                    Request Your Personalized Demo
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6"> 
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6"> 
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
                        <input type="text" name="firstName" id="firstName" required value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-150" /> 
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
                        <input type="text" name="lastName" id="lastName" required value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-150" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                      <input type="text" name="company" id="company" required value={formData.company} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-150" />
                    </div>
                    <div>
                      <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 mb-1">Company email *</label>
                      <input type="email" name="companyEmail" id="companyEmail" required value={formData.companyEmail} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-150" />
                    </div>
                    <div>
                      <label htmlFor="howDidYouHear" className="block text-sm font-medium text-gray-700 mb-1">How did you hear about Tal? *</label>
                      <textarea name="howDidYouHear" id="howDidYouHear" rows={3} required value={formData.howDidYouHear} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-150"></textarea>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6"> 
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Your Company Type *</label>
                          <select name="type" id="type" required value={formData.type} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white transition-all duration-150">
                            <option value="">Select type...</option>
                            <option value="Recruiting Agency">Recruiting Agency</option>
                            <option value="Corporate HR">Corporate HR</option>
                            <option value="Startup">Startup</option>
                            <option value="Enterprise">Enterprise</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="numEmployees" className="block text-sm font-medium text-gray-700 mb-1">Number of Employees *</label>
                          <select name="numEmployees" id="numEmployees" required value={formData.numEmployees} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white transition-all duration-150">
                            <option value="">Select range...</option>
                            <option value="1-10">1-10</option>
                            <option value="11-50">11-50</option>
                            <option value="51-200">51-200</option>
                            <option value="201-500">201-500</option>
                            <option value="500+">500+</option>
                          </select>
                        </div>
                    </div>
                    <div>
                      <label htmlFor="hqLocation" className="block text-sm font-medium text-gray-700 mb-1">Company HQ Location *</label>
                      <select name="hqLocation" id="hqLocation" required value={formData.hqLocation} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white transition-all duration-150">
                        <option value="">Select location...</option>
                        <option value="North America">North America</option>
                        <option value="Europe">Europe</option>
                        <option value="Asia">Asia</option>
                        <option value="South America">South America</option>
                        <option value="Africa">Africa</option>
                        <option value="Australia/Oceania">Australia/Oceania</option>
                      </select>
                    </div>
                    <div className="pt-3"> 
                      <button 
                        type="submit" 
                        className="w-full flex items-center justify-center px-6 py-3.5 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-150 ease-in-out transform hover:scale-[1.02]" 
                      >
                        <Send size={18} className="mr-2.5" />
                        Schedule My Demo
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RequestDemoPage;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock, 
  Send, 
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Users,
  Zap,
  Shield
} from 'lucide-react';

const ContactSupportPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    priority: 'medium',
    category: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const supportCategories = [
    { value: 'technical', label: 'Technical Issue', icon: <AlertCircle className="w-5 h-5" /> },
    { value: 'account', label: 'Account & Billing', icon: <Users className="w-5 h-5" /> },
    { value: 'feature', label: 'Feature Request', icon: <Zap className="w-5 h-5" /> },
    { value: 'security', label: 'Security Concern', icon: <Shield className="w-5 h-5" /> },
    { value: 'general', label: 'General Question', icon: <HelpCircle className="w-5 h-5" /> }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low - General inquiry', color: 'text-green-600' },
    { value: 'medium', label: 'Medium - Standard support', color: 'text-yellow-600' },
    { value: 'high', label: 'High - Business impact', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent - System down', color: 'text-red-600' }
  ];

  const contactMethods = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: <MessageSquare className="w-8 h-8" />,
      availability: 'Mon-Fri, 9AM-6PM EST',
      response: 'Usually responds in minutes',
      action: 'Start Chat',
      primary: true
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: <Mail className="w-8 h-8" />,
      availability: '24/7 submission',
      response: 'Response within 4-24 hours',
      action: 'Send Email',
      primary: false
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our team',
      icon: <Phone className="w-8 h-8" />,
      availability: 'Mon-Fri, 9AM-6PM EST',
      response: 'Available during business hours',
      action: 'Call Now',
      primary: false
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setFormData(prev => ({
      ...prev,
      category
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              Support Request Submitted
            </h2>
            <p className="text-green-700 mb-6">
              Thank you for contacting us! We've received your support request and will get back to you shortly.
            </p>
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Ticket ID:</span>
                <span className="font-mono font-medium">#TAL-{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600">Expected Response:</span>
                <span className="font-medium">Within 4-24 hours</span>
              </div>
            </div>
            <button 
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: '',
                  email: '',
                  subject: '',
                  priority: 'medium',
                  category: '',
                  description: ''
                });
                setSelectedCategory('');
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Contact Support</h1>
        <p className="text-purple-100 text-lg">
          Our team is here to help you succeed with TAL
        </p>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactMethods.map((method, index) => (
          <div 
            key={index}
            className={`bg-white rounded-lg border-2 p-6 transition-all hover:shadow-lg ${
              method.primary ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
            }`}
          >
            <div className={`mb-4 ${method.primary ? 'text-purple-600' : 'text-purple-600'}`}>
              {method.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {method.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {method.description}
            </p>
            <div className="space-y-2 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{method.availability}</span>
              </div>
              <div className="text-gray-600">
                {method.response}
              </div>
            </div>
            <button className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              method.primary 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'border border-purple-600 text-purple-600 hover:bg-purple-50'
            }`}>
              {method.action}
            </button>
          </div>
        ))}
      </div>

      {/* Support Form */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Submit a Support Request
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Fill out the form below and we'll get back to you as soon as possible
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {supportCategories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleCategorySelect(category.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedCategory === category.value
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {category.icon}
                    <span className="font-medium text-sm">{category.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority and Subject */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level *
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
              >
                {priorityLevels.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                placeholder="Brief description of your issue"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
              placeholder="Please provide as much detail as possible about your issue or question. Include any error messages, steps to reproduce, or relevant context."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !selectedCategory || !formData.name || !formData.email || !formData.subject || !formData.description}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Additional Resources */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Before You Contact Us
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Check Our Resources</h4>
            <p className="text-sm text-gray-600 mb-3">
              Many questions can be answered in our comprehensive resource library
            </p>
            <Link 
              to="/dashboard/resources"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Browse Resources →
            </Link>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Community Forum</h4>
            <p className="text-sm text-gray-600 mb-3">
              Connect with other users and find solutions to common questions
            </p>
            <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              Visit Forum →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupportPage;

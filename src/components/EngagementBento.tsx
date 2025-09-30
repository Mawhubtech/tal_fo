import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Bold, Italic, Link, List, Undo2, RotateCw, Mail, Users, Target } from 'lucide-react';
import Button from './Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface Profile {
  name: string;
  role: string;
  company: string;
  skills: string[];
  image: string;
  evaluations: ('pass' | 'fail' | 'partial')[];
}

const profiles: Profile[] = [
  {
    name: 'Michael Jaworski',
    role: 'Technical PM',
    company: 'Amazon',
    skills: ['OpenCV', 'Hadoop', 'Research'],
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
    evaluations: ['pass', 'pass', 'pass']
  },
  {
    name: 'Sarah Markowitz',
    role: 'Product Manager',
    company: 'Waymo',
    skills: ['OpenCV', 'Hadoop', 'Research'],
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    evaluations: ['pass', 'partial', 'pass']
  },
  {
    name: 'Vidhut Srivastava',
    role: 'Founding PM',
    company: 'Carta',
    skills: ['OpenCV', 'Hadoop', 'Research'],
    image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=100',
    evaluations: ['partial', 'fail', 'pass']
  }
];

const EngagementBento: React.FC = () => {
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <section ref={elementRef} className={`relative overflow-hidden bg-gray-50 transition-all duration-1000 transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Evaluate & Engage Candidates
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            AI-powered profile evaluation and personalized outreach in one seamless workflow.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Evaluation - Large Card (spans 2 columns) */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Review and evaluate profiles faster with AI</h3>
                  <p className="text-gray-600 mt-1">Turn your candidate search into an AI-powered spreadsheet.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
                <div className="p-6">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-800 mb-6">
                    <span className="text-purple-600 mr-2">⚡</span>
                    Technical PMs in the Bay Area (742 profiles)
                  </div>

                  <div className="space-y-4">
                    {profiles.map((profile, index) => (
                      <div key={index} className="p-4 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center gap-4">
                          <img 
                            src={profile.image} 
                            alt={profile.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{profile.name}</h4>
                            <p className="text-sm text-gray-600">
                              {profile.role} at {profile.company}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {profile.skills.map((skill, i) => (
                                <span 
                                  key={i}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {profile.evaluations.map((evaluation, i) => (
                              <span key={i}>
                                {evaluation === 'pass' && (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                )}
                                {evaluation === 'partial' && (
                                  <AlertCircle className="w-5 h-5 text-amber-500" />
                                )}
                                {evaluation === 'fail' && (
                                  <XCircle className="w-5 h-5 text-red-500" />
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="primary" size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Try for free
                </Button>
                <Button variant="outline" size="lg" className="!bg-transparent !border-2 !border-gray-300 !text-gray-700 hover:!border-purple-500 hover:!text-purple-600 !bg-none">
                  Request a demo →
                </Button>
              </div>
            </div>
          </div>

          {/* Email Sequences - Medium Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">AI-powered email sequences</h3>
                  <p className="text-sm text-gray-600">Personalized outreach that converts</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gray-600 text-sm">to:</span>
                  <div className="flex-1 bg-white rounded px-2 py-1">
                    <span className="text-sm text-gray-800">kayla.victoria@gmail.com</span>
                  </div>
                  <span className="inline-flex items-center justify-center w-4 h-4 bg-purple-600 rounded-full">
                    <span className="text-white text-xs">✓</span>
                  </span>
                </div>

                <div className="flex items-center gap-1 mb-3 pb-2 border-b border-gray-200">
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600">
                    <Bold className="w-3 h-3" />
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600">
                    <Italic className="w-3 h-3" />
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600">
                    <List className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-gray-800">
                  <p>Hi Kayla,</p>
                  <p>
                    I'm David from TAL. Your profile stood out as a strong fit for our engineering role.{' '}
                    <span className="bg-purple-100 px-1 rounded">Your Apache Lucene experience aligns perfectly with our project.</span>
                  </p>
                  <p>Interested in chatting?</p>
                  <p>Best, David</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white">
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <span className="text-xs text-gray-600">Send email</span>
                </div>
                <button className="text-purple-600 hover:text-purple-700 text-xs font-medium">
                  ⚡ Regenerate
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                Increase response rates with smart outreach. TAL personalizes your email template while retaining your tone and voice.
              </p>

              <Button variant="primary" size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2">
                Start Engaging
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Response Rates</h3>
                <p className="text-sm text-gray-600">AI-optimized outreach</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">This Week</span>
                  <span className="text-2xl font-bold text-green-600">47%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">+12% from last week</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Emails Sent</span>
                  <span className="text-2xl font-bold text-blue-600">1,247</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Across all campaigns</p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Profiles Scored</span>
                  <span className="text-2xl font-bold text-purple-600">742</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Ready for outreach</p>
              </div>
            </div>
          </div>

          {/* Workflow Integration */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Complete Hiring Workflow</h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                From AI evaluation to personalized outreach - everything you need to find and engage top talent in one platform.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Evaluate</h4>
                  <p className="text-sm text-gray-600">AI scores profiles against your criteria</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Engage</h4>
                  <p className="text-sm text-gray-600">Personalized outreach at scale</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Convert</h4>
                  <p className="text-sm text-gray-600">Higher response rates guaranteed</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  Get Started Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="!bg-transparent !border-2 !border-gray-300 !text-gray-700 hover:!border-purple-500 hover:!text-purple-600 !bg-none font-semibold"
                >
                  Book Demo →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngagementBento;
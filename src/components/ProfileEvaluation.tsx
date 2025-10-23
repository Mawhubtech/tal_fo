import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
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

const ProfileEvaluation: React.FC = () => {
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <section ref={elementRef} className={`relative overflow-hidden transition-all duration-1000 transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-center lg:text-left">
              Review and evaluate<br />profiles faster with AI
            </h2>
            <p className="text-lg text-gray-600 mb-8 text-center lg:text-left">
              Turn your candidate search into an AI-powered spreadsheet. Autopilot ranks, scores, and organizes profiles based on your criteria for best-fit talent without manual screening.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button variant="primary" size="lg">
                Try for free
              </Button>
              <Button variant="outline" size="lg">
                Request a demo →
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
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
                        <h3 className="font-medium">{profile.name}</h3>
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
        </div>
      </div>
    </section>
  );
};

export default ProfileEvaluation;

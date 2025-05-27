import React from 'react';
import { Building2, CircleDollarSign, Shield, Briefcase, Award, Globe, Cpu, Cloud, Database, LineChart } from 'lucide-react';

const partners = [
  { icon: Building2, name: 'Microsoft' },
  { icon: CircleDollarSign, name: 'Goldman Sachs' },
  { icon: Shield, name: 'Palantir' },
  { icon: Briefcase, name: 'McKinsey' },
  { icon: Award, name: 'Accenture' },
  { icon: Globe, name: 'Salesforce' },
  { icon: Cpu, name: 'Intel' },
  { icon: Cloud, name: 'AWS' },
  { icon: Database, name: 'Oracle' },
  { icon: LineChart, name: 'Bloomberg' },
  // Duplicate the list for seamless scrolling
  { icon: Building2, name: 'Microsoft' },
  { icon: CircleDollarSign, name: 'Goldman Sachs' },
  { icon: Shield, name: 'Palantir' },
  { icon: Briefcase, name: 'McKinsey' },
  { icon: Award, name: 'Accenture' },
  { icon: Globe, name: 'Salesforce' },
  { icon: Cpu, name: 'Intel' },
  { icon: Cloud, name: 'AWS' },
  { icon: Database, name: 'Oracle' },
  { icon: LineChart, name: 'Bloomberg' },
];

const PartnersSlider: React.FC = () => {
  return (
    <section className="w-full border-y border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-500 text-center mb-6">Trusted by leading companies worldwide</p>
        
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>
          <div className="flex animate-scroll">
            {partners.map((Partner, index) => (
              <div
                key={index}
                className="flex items-center justify-center min-w-[180px] px-6"
              >
                <div className="flex items-center space-x-2 text-gray-600">
                  <Partner.icon className="w-5 h-5" />
                  <span className="font-medium">{Partner.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSlider;
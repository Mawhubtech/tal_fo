import React from 'react';
import { CircleDollarSign, Users, Database, Mail } from 'lucide-react';

interface IntegrationCard {
  title: string;
  description: string;
  icon: React.ElementType;
  preview: React.ReactNode;
}

const Integrations: React.FC = () => {
  const cards: IntegrationCard[] = [
    {
      title: "Investor & funding data",
      description: "Identify talent by funding stage, investors, and revenue.",
      icon: CircleDollarSign,
      preview: (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100" 
              alt="Profile" 
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Just now</p>
              <p className="text-sm font-medium">Find engineers at series A through C companies backed by Sequoia</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Top 10 employers in your search pool</p>
            <div className="flex items-center gap-2">
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              <div className="flex-1 h-2 bg-purple-100 rounded-full" />
              <span className="text-sm text-gray-600">45 (5%)</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="https://www.meta.com/favicon.ico" className="w-5 h-5" alt="Meta" />
              <div className="flex-1 h-2 bg-purple-100 rounded-full" style={{ width: '80%' }} />
              <span className="text-sm text-gray-600">39 (4%)</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "ATS Integrations",
      description: "Sync with one of 41 ATS systems and 21 CRMs.",
      icon: Database,
      preview: (
        <div className="grid grid-cols-5 gap-4">
          <img src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.iconsdb.com%2Fgreen-icons%2Fhouse-icon.html&psig=AOvVaw1LZN6sHEdTRuk1JIyUzx3T&ust=1748443201782000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCMiCwtHww40DFQAAAAAdAAAAABAE" className="w-10 h-10" alt="Greenhouse" />
          <img src="https://www.lever.co/favicon.ico" className="w-10 h-10" alt="Lever" />
          <img src="https://www.workday.com/favicon.ico" className="w-10 h-10" alt="Workday" />
          <img src="https://www.salesforce.com/favicon.ico" className="w-10 h-10" alt="Salesforce" />
          <img src="https://www.hubspot.com/favicon.ico" className="w-10 h-10" alt="Hubspot" />
          <img src="https://www.bamboohr.com/favicon.ico" className="w-10 h-10" alt="BambooHR" />
          <img src="https://www.jobvite.com/favicon.ico" className="w-10 h-10" alt="Jobvite" />
          <img src="https://www.jazzhr.com/favicon.ico" className="w-10 h-10" alt="JazzHR" />
          <img src="https://www.icims.com/favicon.ico" className="w-10 h-10" alt="iCIMS" />
          <img src="https://www.smartrecruiters.com/favicon.ico" className="w-10 h-10" alt="SmartRecruiters" />
        </div>
      )
    },
    {
      title: "Technical profile data",
      description: "View Github, Stack Overflow, and research data within TalGPT.",
      icon: Users,
      preview: (
        <div className="flex items-start gap-3">
          <img 
            src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100" 
            alt="Profile" 
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-medium">Raquel Dominic</h3>
            <p className="text-sm text-gray-500">San Francisco, California, USA</p>
            <div className="flex gap-2 mt-2">
              <img src="https://github.com/favicon.ico" className="w-5 h-5" alt="GitHub" />
              <img src="https://stackoverflow.com/favicon.ico" className="w-5 h-5" alt="Stack Overflow" />
              <img src="https://www.linkedin.com/favicon.ico" className="w-5 h-5" alt="LinkedIn" />
              <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" className="w-5 h-5" alt="Email" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Contact waterfall",
      description: "Verified personal + professional email data, as well as phone numbers.",
      icon: Mail,
      preview: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
            <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" className="w-6 h-6" alt="Gmail" />
            <span className="text-sm">Primary Email</span>
            <span className="ml-auto text-green-500">✓</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
            <img src="https://outlook.com/favicon.ico" className="w-6 h-6" alt="Outlook" />
            <span className="text-sm">Work Email</span>
            <span className="ml-auto text-amber-500">?</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
            <img src="https://slack.com/favicon.ico" className="w-6 h-6" alt="Slack" />
            <span className="text-sm">Slack</span>
            <span className="ml-auto text-green-500">✓</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="relative overflow-hidden py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold mb-8">Integrated with 30+ data sources</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-8 items-center justify-center">
            <img src="https://www.google.com/favicon.ico" className="w-8 h-8" alt="Google" />
            <img src="https://www.linkedin.com/favicon.ico" className="w-8 h-8" alt="LinkedIn" />
            <img src="https://www.github.com/favicon.ico" className="w-8 h-8" alt="GitHub" />
            <img src="https://www.stackoverflow.com/favicon.ico" className="w-8 h-8" alt="Stack Overflow" />
            <img src="https://www.slack.com/favicon.ico" className="w-8 h-8" alt="Slack" />
            <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" className="w-8 h-8" alt="Gmail" />
            <img src="https://www.microsoft.com/favicon.ico" className="w-8 h-8" alt="Microsoft" />
            <img src="https://www.aws.amazon.com/favicon.ico" className="w-8 h-8" alt="AWS" />
            <img src="https://www.atlassian.com/favicon.ico" className="w-8 h-8" alt="Atlassian" />
            <img src="https://www.salesforce.com/favicon.ico" className="w-8 h-8" alt="Salesforce" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <card.icon className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{card.title}</h3>
                  <p className="text-gray-600">{card.description}</p>
                </div>
              </div>
              <div className="mt-6">{card.preview}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Integrations;
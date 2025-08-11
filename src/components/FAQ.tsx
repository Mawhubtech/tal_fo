import React, { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: "Who can use TAL?",
      answer: (
        <>
          TAL is designed for recruiters, hiring managers, talent acquisition teams, and job seekers at companies of all sizes. Whether you're a startup looking to scale your team, an enterprise organization managing high-volume hiring, or a professional seeking new opportunities, our AI-powered platform can help streamline your recruitment process.
        </>
      )
    },
    {
      question: "Can I try TAL for free?",
      answer: (
        <>
          Yes! We offer a 14-day free trial that includes full access to all features, including AI-powered search, email outreach, and talent insights. No credit card required to start your trial.
        </>
      )
    },
    {
      question: "What features are included in the TAL platform?",
      answer: (
        <>
          TAL includes all recruitment tools in one integrated platform:
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>AI-powered talent search with natural language queries</li>
            <li>Talent insights for data-driven hiring decisions</li>
            <li>Automated email outreach for candidate engagement</li>
            <li>TAL Agents for 24/7 recruitment automation</li>
            <li>Advanced analytics and reporting</li>
          </ul>
        </>
      )
    },
    {
      question: "Where does TAL source its data?",
      answer: (
        <>
          TAL aggregates data from over 30 trusted sources, including professional networks, technical platforms, and public databases. We maintain strict compliance with data privacy regulations and regularly update our data to ensure accuracy and relevance.
        </>
      )
    },
    {
      question: "How does TAL use AI in recruitment?",
      answer: (
        <>
          TAL leverages advanced AI models to:
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Understand natural language search queries</li>
            <li>Generate personalized email outreach campaigns</li>
            <li>Analyze candidate profiles and predict job fit</li>
            <li>Automate routine recruitment tasks and workflows</li>
            <li>Provide intelligent matching between candidates and opportunities</li>
          </ul>
        </>
      )
    },
    {
      question: "What kind of integrations does TAL support?",
      answer: (
        <>
          TAL integrates seamlessly with your existing recruitment stack:
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Popular ATS systems (Greenhouse, Lever, BambooHR)</li>
            <li>Email platforms (Gmail, Outlook, SendGrid)</li>
            <li>CRM systems (Salesforce, HubSpot)</li>
            <li>Communication tools (Slack, Microsoft Teams)</li>
            <li>Custom integrations via API</li>
          </ul>
        </>
      )
    }
  ];

  return (
    <section className="relative overflow-hidden py-32 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">FAQ</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about TAL and how it can transform your recruitment process.
          </p>
        </div>

        <div className="space-y-6">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border-b border-gray-200 last:border-b-0"
            >
              <button
                className="w-full py-8 text-left flex items-center justify-between group hover:bg-gray-50/50 transition-colors duration-200"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-2xl md:text-3xl font-medium text-gray-900 pr-8 leading-tight">
                  {item.question}
                </span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronDown className="w-8 h-8 text-gray-500 transform rotate-180 transition-transform duration-300" />
                  ) : (
                    <Plus className="w-8 h-8 text-gray-500 transition-transform duration-300 group-hover:scale-110" />
                  )}
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 pb-8' : 'max-h-0'
                }`}
              >
                <div className="text-lg text-gray-600 leading-relaxed pr-12">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
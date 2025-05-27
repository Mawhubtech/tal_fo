import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: "Who can use TalGPT?",
      answer: (
        <>
          TalGPT is designed for recruiters, hiring managers, and talent acquisition teams at companies of all sizes. Whether you're a startup looking to scale your team or an enterprise organization managing high-volume hiring, our AI-powered platform can help streamline your recruitment process.
        </>
      )
    },
    {
      question: "Can I try TalGPT for free?",
      answer: (
        <>
          Yes! We offer a 14-day free trial that includes full access to all features, including PeopleGPT search, email outreach, and talent insights. No credit card required to start your trial.
        </>
      )
    },
    {
      question: "Are PeopleGPT, Talent Insights, and Email Outreach all part of the TalGPT platform?",
      answer: (
        <>
          Yes, all these features are fully integrated into the TalGPT platform. You get access to:
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>PeopleGPT for natural language talent search</li>
            <li>Talent Insights for data-driven hiring decisions</li>
            <li>Email Outreach for automated candidate engagement</li>
            <li>TalGPT Agents for 24/7 recruitment automation</li>
          </ul>
        </>
      )
    },
    {
      question: "Where does TalGPT source its data?",
      answer: (
        <>
          TalGPT aggregates data from over 30 trusted sources, including professional networks, technical platforms, and public databases. We maintain strict compliance with data privacy regulations and regularly update our data to ensure accuracy.
        </>
      )
    },
    {
      question: "How does TalGPT use generative AI?",
      answer: (
        <>
          TalGPT leverages advanced AI models to:
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Understand natural language search queries</li>
            <li>Generate personalized email outreach</li>
            <li>Analyze candidate profiles and predict job fit</li>
            <li>Automate routine recruitment tasks</li>
          </ul>
          Our AI is continuously trained on recruitment best practices and industry data.
        </>
      )
    },
    {
      question: "What are Talent Insights?",
      answer: (
        <>
          Talent Insights provides real-time analytics and market intelligence about your talent pool, including:
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Compensation benchmarks</li>
            <li>Skill availability analysis</li>
            <li>Diversity metrics</li>
            <li>Competitor hiring trends</li>
          </ul>
        </>
      )
    },
    {
      question: "How can I use AI Email Outreach to convert potential candidates?",
      answer: (
        <>
          Our AI Email Outreach system helps you:
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Craft personalized messages based on candidate profiles</li>
            <li>Optimize send times for maximum response rates</li>
            <li>A/B test different message variations</li>
            <li>Track engagement and automate follow-ups</li>
          </ul>
        </>
      )
    },
    {
      question: "Where can I learn more about how to use TalGPT?",
      answer: (
        <>
          We offer comprehensive resources to help you get the most out of TalGPT:
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Interactive product tours</li>
            <li>Video tutorials and webinars</li>
            <li>Documentation and best practices</li>
            <li>1-on-1 onboarding sessions</li>
          </ul>
        </>
      )
    },
    {
      question: "Is there a monthly plan available?",
      answer: (
        <>
          Yes, we offer flexible monthly and annual plans to suit your needs:
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Starter: Perfect for small teams</li>
            <li>Professional: Most popular for growing companies</li>
            <li>Enterprise: Custom solutions for large organizations</li>
          </ul>
          Contact our sales team for detailed pricing information.
        </>
      )
    }
  ];

  return (
    <section className="relative overflow-hidden py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-gray-600">Everything you need to know about TalGPT</p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200"
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`px-6 overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'py-4' : 'max-h-0'
                }`}
              >
                <div className="text-gray-600">{item.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
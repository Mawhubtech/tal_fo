import React from 'react';
import { Shield } from 'lucide-react';

const Footer: React.FC = () => {
  const sections = [
    {
      title: 'PRODUCTS',
      links: [
        { label: 'Search (PeopleGPT)', href: '/search' },
        { label: 'Talent Insights', href: '/insights' },
        { label: 'Email Outreach', href: '/email' },
        { label: 'Chrome Extension', href: '/extension' },
      ],
    },
    {
      title: 'LEGAL',
      links: [
        { label: 'Terms and Conditions', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'GDPR & CCPA', href: '/gdpr' },
        { label: 'Cookie Settings', href: '#' },
      ],
    },
    {
      title: 'SUPPORT',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Privacy Choices', href: '/privacy-choices' },
        { label: 'Email Support', href: '/support' },
        { label: 'Request a Demo', href: '/demo' },
        { label: 'Responsible Disclosure', href: '/disclosure' },
        { label: 'Status', href: '/status' },
      ],
    },
    {
      title: 'RESOURCES',
      links: [
        { label: 'Docs', href: '/docs' },
        { label: 'Announcements', href: '/announcements' },
        { label: 'Articles', href: '/articles' },
        { label: 'Referral Program', href: '/referral' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Search Library', href: '/library' },
        { label: 'Video Demo', href: '/video-demo' },
      ],
    },
    {
      title: 'COMPANY',
      links: [
        { label: 'Careers', href: '/careers' },
        { label: 'LinkedIn', href: 'https://linkedin.com' },
        { label: 'Twitter', href: 'https://twitter.com' },
      ],
    },
    {
      title: 'SECURITY',
      links: [
        { label: 'Trust Center', href: '/trust' },
        { label: 'AI Audit Center', href: '/ai-audit' }
      ],
      certifications: [
        { name: 'SOC2 Type II Certified' },
        { name: 'ISO 27001 Certified' }
      ]
    },
  ];

  return (
    <footer className="relative bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-lines opacity-5 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="text-sm font-medium mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              {section.certifications && (
                <div className="mt-4 space-y-2">
                  {section.certifications.map((cert, certIndex) => (
                    <div 
                      key={certIndex}
                      className="text-xs text-gray-400 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      {cert.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-500" />
            <span className="text-gray-400">Made in Dubai</span>
          </div>
          
          <a 
            href="mailto:sales@talgpt.work"
            className="text-gray-400 hover:text-white transition-colors"
          >
            sales@talgpt.work
          </a>
          
          <span className="text-gray-400">
            All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
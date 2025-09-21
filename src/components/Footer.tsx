import React from 'react';
import { Shield } from 'lucide-react';

const Footer: React.FC = () => {
  const sections = [
    {
      title: 'COMPANY',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'LEGAL',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ],
    },
    {
      title: 'SUPPORT',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Documentation', href: '/docs' },
      ],
    },
  ];

  return (
    <footer className="relative bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-lines opacity-5 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-500" />
            <span className="text-gray-400">Made in Dubai</span>
          </div>
          
          <a 
            href="mailto:contact@talplatform.ai"
            className="text-gray-400 hover:text-white transition-colors"
          >
            contact@talplatform.ai
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

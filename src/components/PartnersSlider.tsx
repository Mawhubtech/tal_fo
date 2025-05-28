import React from 'react';

interface Partner {
  name: string;
  logo: string;
}

const partners: Partner[] = [
  { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png' },
  { name: 'Goldman Sachs', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Goldman_Sachs.svg/200px-Goldman_Sachs.svg.png' },
  { name: 'Palantir', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Palantir_Technologies_logo.svg/200px-Palantir_Technologies_logo.svg.png' },
  { name: 'McKinsey', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/McKinsey_%26_Company_logo.svg/200px-McKinsey_%26_Company_logo.svg.png' },
  { name: 'Accenture', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Accenture.svg/200px-Accenture.svg.png' },
  { name: 'Salesforce', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/200px-Salesforce.com_logo.svg.png' },
  { name: 'Intel', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/200px-Intel_logo_%282006-2020%29.svg.png' },
  { name: 'AWS', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/200px-Amazon_Web_Services_Logo.svg.png' },
  { name: 'Oracle', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/200px-Oracle_logo.svg.png' },
  { name: 'Bloomberg', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Bloomberg_L.P._logo.svg/200px-Bloomberg_L.P._logo.svg.png' },
];

// Duplicate the list for seamless scrolling
const allPartners = [...partners, ...partners];

const PartnersSlider: React.FC = () => {
  return (
    <section className="w-full border-y border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-500 text-center mb-6">Trusted by leading companies worldwide</p>
        
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>
          <div className="flex animate-scroll">
            {allPartners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center justify-center min-w-[180px] px-6"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-8 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSlider;
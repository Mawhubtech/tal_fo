import React, { useState, useEffect } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import UserTypeSelectModal from './UserTypeSelectModal';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Commented out: User type modal state
  // const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Classes defined but not currently used - keeping for potential future use
  // const scrolledNavClasses = 'bg-white/80 backdrop-blur-md shadow-sm';
  // const topNavClasses = 'bg-transparent';

  const linkTextColor = isScrolled ? 'text-slate-700 hover:text-primary-600' : 'text-slate-700 hover:text-primary-600';
  
  // Commented out: User type modal handlers - now navigating directly to /signin
  // // Handle opening the user type modal
  // const handleOpenUserTypeModal = () => {
  //   setIsUserTypeModalOpen(true);
  // };
  
  // // Handle recruiter selection
  // const handleSelectRecruiter = () => {
  //   setIsUserTypeModalOpen(false);
  //   navigate('/signin');
  // };
  
  // // Handle job seeker selection
  // const handleSelectJobSeeker = () => {
  //   setIsUserTypeModalOpen(false);
  //   navigate('/job-seeker/login');
  // };

  // // Handle organization selection
  // const handleSelectOrganization = () => {
  //   setIsUserTypeModalOpen(false);
  //   navigate('/organization/signin');
  // };

  const outlineButtonClasses = isScrolled 
    ? 'px-5 py-2.5 border border-purple-300 text-purple-700 hover:bg-purple-100 hover:border-purple-400 rounded-full transition-colors text-base font-medium'
    : 'px-5 py-2.5 border border-purple-500 text-purple-700 hover:bg-purple-700/10 hover:border-purple-600 rounded-full transition-colors text-base font-medium';
  
  const primaryButtonClasses = "bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5 py-2.5 text-base font-medium transition-colors";

  return (
    <>
    <header className="sticky top-0 z-50 w-full transition-all duration-300 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center group">
              {/* Text logo using ROMA font */}
              <span 
                className="text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200"
                style={{ fontFamily: 'ROMA, serif' }}
              >
                TAL
              </span>
            </Link>
            {/* Commented out: Pricing and Jobs navigation links */}
            {/* <div className="hidden md:flex items-center space-x-6">
              <span className="text-gray-300 text-xl">|</span>
              <a href="/pricing" className={`transition-colors text-lg font-semibold ${linkTextColor}`}>
                Pricing
              </a>
              <Link 
                to="/jobs" 
                className={`transition-colors text-lg font-semibold ${linkTextColor}`}
              >
                Jobs
              </Link>
            </div> */}
          </div>          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Commented out: Request a demo button */}
            {/* <Link 
              to="/request-demo" 
              className={outlineButtonClasses}
            >
              Request a demo
            </Link> */}
            <button 
              onClick={() => navigate('/signin')} 
              className={primaryButtonClasses}
            >
              Sign in
            </button>
          </nav>

          {/* Mobile menu button */}
          <button 
            className={`md:hidden p-2 rounded-md transition-colors ${
              isScrolled ? 'text-slate-600 hover:text-primary-600 hover:bg-slate-100' : 'text-slate-600 hover:text-primary-600 hover:bg-slate-700/10'
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className={`md:hidden py-2 ${isScrolled ? 'bg-white/95' : 'bg-white'} absolute left-0 right-0 top-full shadow-lg`}> {/* Added absolute positioning and shadow */}
          <div className="px-4 pt-2 pb-3 space-y-2">
            {/* Commented out: Pricing, Jobs, and Request a demo links */}
            {/* <a href="/pricing" className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100 rounded-md">
              Pricing
            </a>
            <Link 
              to="/jobs" 
              className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100 rounded-md"
            >
              Jobs
            </Link>
            <Link 
              to="/request-demo" 
              className={`block w-full text-center rounded-full px-5 py-2.5 text-base font-medium transition-colors ${outlineButtonClasses}`}
            >
              Request a demo
            </Link> */}
            <button 
              onClick={() => navigate('/signin')} 
              className={`block w-full text-center rounded-full px-5 py-2.5 text-base font-medium transition-colors ${primaryButtonClasses}`}
            >
              Sign in
            </button>
          </div>
        </div>      )}
    </header>
    
    {/* Commented out: User Type Selection Modal - navigating directly to /signin */}
    {/* <UserTypeSelectModal
      isOpen={isUserTypeModalOpen}
      onClose={() => setIsUserTypeModalOpen(false)}
      onSelectRecruiter={handleSelectRecruiter}
      onSelectJobSeeker={handleSelectJobSeeker}
      onSelectOrganization={handleSelectOrganization}
    /> */}
    </>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import UserTypeSelectModal from './UserTypeSelectModal';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false);
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
  
  // Handle opening the user type modal
  const handleOpenUserTypeModal = () => {
    setIsUserTypeModalOpen(true);
  };
  
  // Handle recruiter selection
  const handleSelectRecruiter = () => {
    setIsUserTypeModalOpen(false);
    navigate('/signin');
  };
  
  // Handle job seeker selection
  const handleSelectJobSeeker = () => {
    setIsUserTypeModalOpen(false);
    navigate('/job-seeker/login');
  };

  // Handle organization selection
  const handleSelectOrganization = () => {
    setIsUserTypeModalOpen(false);
    navigate('/organization/signin');
  };

  const outlineButtonClasses = isScrolled 
    ? 'px-5 py-2.5 border border-purple-300 text-purple-700 hover:bg-purple-100 hover:border-purple-400 rounded-full transition-colors text-base font-medium'
    : 'px-5 py-2.5 border border-purple-500 text-purple-700 hover:bg-purple-700/10 hover:border-purple-600 rounded-full transition-colors text-base font-medium';
  
  const primaryButtonClasses = "bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5 py-2.5 text-base font-medium transition-colors";

  return (
    <>
    <header className="sticky top-0 z-50 w-full transition-all duration-300 border-b border-black bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              {/* Image logo */}
              <img 
                src="/TALL.png" 
                alt="TAL" 
                className="h-8 md:h-10 w-auto"
              />
            </Link>
          </div>          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <div className="relative group">
              <button className={`flex items-center space-x-1 transition-colors text-base font-medium ${linkTextColor}`}>
                <span>Product</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {/* Dropdown would go here */}
            </div>
            <a href="/pricing" className={`transition-colors text-base font-medium ${linkTextColor}`}>
              Pricing
            </a>
            <Link 
              to="/jobs" 
              className={`transition-colors text-base font-medium ${linkTextColor}`}
            >
              Jobs
            </Link>
            <Link 
              to="/request-demo" 
              className={primaryButtonClasses}
            >
              Request a demo
            </Link>            <button 
              onClick={handleOpenUserTypeModal} 
              className={outlineButtonClasses}
            >
              Sign in
            </button>
            <Link 
              to="/try-free" 
              className={outlineButtonClasses}
            >
              Try for free
            </Link>
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
            <a href="#" className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100 rounded-md">
              Product
            </a>
            <a href="/pricing" className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100 rounded-md">
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
              className={`block w-full text-center rounded-full px-5 py-2.5 text-base font-medium transition-colors ${primaryButtonClasses}`}
            >
              Request a demo
            </Link>            <button 
              onClick={handleOpenUserTypeModal} 
              className={`block w-full text-center rounded-full px-5 py-2.5 text-base font-medium transition-colors ${outlineButtonClasses}`}
            >
              Sign in
            </button>
            <Link 
              to="/try-free" 
              className={`block w-full text-center rounded-full px-5 py-2.5 text-base font-medium transition-colors ${outlineButtonClasses}`}            >
              Try for free
            </Link>          </div>
        </div>      )}
    </header>
    
    {/* User Type Selection Modal */}
    <UserTypeSelectModal
      isOpen={isUserTypeModalOpen}
      onClose={() => setIsUserTypeModalOpen(false)}
      onSelectRecruiter={handleSelectRecruiter}
      onSelectJobSeeker={handleSelectJobSeeker}
      onSelectOrganization={handleSelectOrganization}
    />
    </>
  );
};

export default Navbar;
import React, { useState, useEffect } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import Button from './Button';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <img src="/tallogo.png" alt="Tal" className="h-12 md:h-16" />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button className="flex items-center space-x-1 text-slate-700 hover:text-primary-600 transition-colors">
                <span>Product</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {/* Dropdown would go here */}
            </div>
            <div className="relative group">
              <button className="flex items-center space-x-1 text-slate-700 hover:text-primary-600 transition-colors">
                <span>Resources</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {/* Dropdown would go here */}
            </div>
            <a href="/pricing" className="text-slate-700 hover:text-primary-600 transition-colors">
              Pricing
            </a>
            <a href="/demo" className="text-primary-600 hover:text-primary-700 transition-colors">
              Request a demo
            </a>
            <a href="/signin" className="text-slate-700 hover:text-primary-600 transition-colors">
              Sign in
            </a>
            <Button variant="primary" size="sm">
              Try for free
            </Button>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <a href="#" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md">
              Product
            </a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md">
              Resources
            </a>
            <a href="/pricing" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md">
              Pricing
            </a>
            <a href="/demo" className="block px-3 py-2 text-base font-medium text-primary-600 hover:bg-gray-100 rounded-md">
              Request a demo
            </a>
            <a href="/signin" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md">
              Sign in
            </a>
            <div className="mt-4 px-3">
              <Button variant="primary" size="full">
                Try for free
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
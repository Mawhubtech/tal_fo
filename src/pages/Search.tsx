import React, { useState } from 'react';
import {
  FileText,
  ToggleRight,
  Search as SearchIcon,
  Filter,
} from 'lucide-react';
import Button from '../components/Button';
import FilterDialog from '../components/FilterDialog';
import BooleanSearchDialog from '../components/BooleanSearchDialog';
import JobDescriptionDialog from '../components/JobDescriptionDialog';

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isBooleanDialogOpen, setIsBooleanDialogOpen] = useState(false);
  const [isJobDescriptionDialogOpen, setIsJobDescriptionDialogOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-6">
      {/* Logo and title */}
      <div className="text-center mb-8">
        <img src="/TALL.png" alt="PeopleGPT" className="h-12 mx-auto mb-2" />
         <p className="text-gray-500 text-sm mt-1">
          Find exactly who you're looking for, in seconds.
          <a href="#" className="ml-1 text-purple-700 hover:text-purple-800 hover:underline transition-colors">
            See how it works.
          </a>
        </p>
      </div>
      
      {/* Who are you looking for section */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex items-center gap-2 mb-2">
          <SearchIcon className="w-4 h-4 text-gray-500" />
          <h2 className="text-base font-medium text-gray-700">Who are you looking for?</h2>
        </div>
        
        <div className="relative">
          <div className="bg-white p-3 rounded-lg flex items-center gap-2 border border-gray-200 shadow-sm hover:shadow transition-shadow">
            <SearchIcon className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Software Engineers with 5+ yrs of experience at fintech companies in the Bay Area"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 text-gray-800 placeholder-gray-400 text-sm"
            />            <button className="bg-purple-700 hover:bg-purple-800 text-white p-1.5 rounded-md transition-colors">
              →
            </button>
          </div>
        </div>
          {/* Search filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="flex items-center bg-purple-50 rounded-full px-3 py-0.5 border border-purple-100 shadow-sm">
            <input type="checkbox" checked className="mr-1.5 h-3 w-3 accent-purple-700" readOnly />
            <span className="text-xs text-purple-700">Location</span>
          </div>
          <div className="flex items-center bg-purple-50 rounded-full px-3 py-0.5 border border-purple-100 shadow-sm">
            <input type="checkbox" checked className="mr-1.5 h-3 w-3 accent-purple-700" readOnly />
            <span className="text-xs text-purple-700">Job Title</span>
          </div>
          <div className="flex items-center bg-purple-50 rounded-full px-3 py-0.5 border border-purple-100 shadow-sm">
            <input type="checkbox" checked className="mr-1.5 h-3 w-3 accent-purple-700" readOnly />
            <span className="text-xs text-purple-700">Years of Experience</span>
          </div>
          <div className="flex items-center bg-purple-50 rounded-full px-3 py-0.5 border border-purple-100 shadow-sm">
            <input type="checkbox" checked className="mr-1.5 h-3 w-3 accent-purple-700" readOnly />
            <span className="text-xs text-purple-700">Industry</span>
          </div>
          <div className="flex items-center bg-purple-50 rounded-full px-3 py-0.5 border border-purple-100 shadow-sm">
            <input type="checkbox" checked className="mr-1.5 h-3 w-3 accent-purple-700" readOnly />
            <span className="text-xs text-purple-700">Skills</span>
          </div>
        </div>
      </div>      {/* Action buttons */}      <div className="flex gap-3 mt-6">
        <Button
          variant="primary"
          className="gap-2 text-xs bg-purple-700 hover:bg-purple-800 text-white px-3 py-1 rounded-md"
          onClick={() => setIsJobDescriptionDialogOpen(true)}
        >
          <FileText className="w-3.5 h-3.5 text-white" />
          Job Description
        </Button><Button
          variant="primary"
          className="gap-2 text-xs bg-purple-700 hover:bg-purple-800 text-white px-3 py-1 rounded-md"
          onClick={() => setIsBooleanDialogOpen(true)}
        >
          <ToggleRight className="w-3.5 h-3.5 text-white" />
          Boolean
        </Button><Button
          variant="primary"
          className="gap-2 text-xs bg-purple-700 hover:bg-purple-800 text-white px-3 py-1 rounded-md"
          onClick={() => setIsFilterDialogOpen(true)}
        >
          <Filter className="w-3.5 h-3.5 text-white" />
          Select Manually
        </Button>
      </div>      {/* Filter Dialog */}
      <FilterDialog 
        isOpen={isFilterDialogOpen} 
        onClose={() => setIsFilterDialogOpen(false)} 
      />      {/* Boolean Search Dialog */}
      <BooleanSearchDialog
        isOpen={isBooleanDialogOpen}
        onClose={() => setIsBooleanDialogOpen(false)}
      />

      {/* Job Description Dialog */}
      <JobDescriptionDialog
        isOpen={isJobDescriptionDialogOpen}
        onClose={() => setIsJobDescriptionDialogOpen(false)}
      />
    </div>
  );
};

export default Search;

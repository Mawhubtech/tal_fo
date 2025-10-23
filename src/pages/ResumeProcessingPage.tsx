import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileText, Package, Sparkles } from 'lucide-react';
import SingleCVProcessing from '../components/SingleCVProcessing';
import BulkCVProcessing from '../components/BulkCVProcessing';

const ResumeProcessingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('single');
  
  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-600 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800">
                  AI-Powered CV Processing
                </h1>
              </div>
              <p className="text-slate-600 text-base max-w-2xl">
                Transform candidate CVs into structured profiles with our advanced AI extraction engine. 
                Process individually for precision or in bulk for efficiency.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Enhanced Tab List */}
          <div className="mb-8">
            <TabsList className="grid grid-cols-2 max-w-xl mx-auto h-auto p-1 bg-white border border-slate-200 shadow-sm rounded-lg">
              <TabsTrigger 
                value="single" 
                className="flex items-center justify-center gap-3 px-6 py-4 rounded-md bg-white hover:bg-purple-50 text-slate-700 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <FileText className="w-5 h-5" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-sm">Single CV</span>
                  <span className="text-xs opacity-75">One-by-one processing</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="bulk" 
                className="flex items-center justify-center gap-3 px-6 py-4 rounded-md bg-white hover:bg-purple-50 text-slate-700 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <Package className="w-5 h-5" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-sm">Bulk Processing</span>
                  <span className="text-xs opacity-75">ZIP file batch upload</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Tab Content with Fade Animation */}
          <TabsContent value="single" className="mt-0 animate-in fade-in duration-300">
            <SingleCVProcessing />
          </TabsContent>
          
          <TabsContent value="bulk" className="mt-0 animate-in fade-in duration-300">
            <BulkCVProcessing />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResumeProcessingPage;

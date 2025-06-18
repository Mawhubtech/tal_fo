import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileText, Package } from 'lucide-react';
import SingleCVProcessing from '../components/SingleCVProcessing';
import BulkCVProcessing from '../components/BulkCVProcessing';

const ResumeProcessingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('single');
  
  return (
    <div className="w-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">CV Processing</h1>
        <p className="text-slate-500 mt-2">
          Process candidate CVs individually or in bulk to extract structured data and create candidate profiles
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Single CV</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>Bulk Processing</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="single" className="mt-2">
          <SingleCVProcessing />
        </TabsContent>
        
        <TabsContent value="bulk" className="mt-2">
          <BulkCVProcessing />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeProcessingPage;

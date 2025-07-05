import React, { useState, useEffect } from 'react';
import { X, Download, Loader2, Check, AlertCircle, ChevronDown, ChevronUp, Sparkles, Info } from 'lucide-react';
import { useAvailablePresets, useCreatePresetTemplates } from '../hooks/useEmailManagement';
import type { CreatePresetTemplatesDto, PresetTemplateInfo } from '../hooks/useEmailManagement';
import { useToast } from '../contexts/ToastContext';

interface PresetTemplatesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PresetTemplatesDialog: React.FC<PresetTemplatesDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const { data: presetsData, isLoading: isLoadingPresets } = useAvailablePresets();
  const createPresetsMutation = useCreatePresetTemplates();

  // Form state
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [scope, setScope] = useState<'personal' | 'team' | 'organization' | 'global'>('personal');
  const [generateAll, setGenerateAll] = useState(false);
  const [useAiGeneration, setUseAiGeneration] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTypes([]);
      setSelectedCategories([]);
      setScope('personal');
      setGenerateAll(false);
      setUseAiGeneration(false);
      setShowAdvanced(false);
      setShowPreview(false);
    }
  }, [isOpen]);

  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    setGenerateAll(false);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setGenerateAll(false);
  };

  const handleGenerateAllChange = (checked: boolean) => {
    setGenerateAll(checked);
    if (checked) {
      setSelectedTypes([]);
      setSelectedCategories([]);
    }
  };

  const getFilteredTemplates = (): PresetTemplateInfo[] => {
    if (!presetsData?.templates) return [];
    
    if (generateAll) {
      return presetsData.templates;
    }

    return presetsData.templates.filter(template => {
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(template.type);
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(template.category);
      return typeMatch && categoryMatch;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const createDto: CreatePresetTemplatesDto & { useAiGeneration?: boolean } = {
      scope,
      generateAll,
      useAiGeneration,
    };

    if (!generateAll) {
      if (selectedTypes.length > 0) {
        createDto.templateTypes = selectedTypes;
      }
      if (selectedCategories.length > 0) {
        createDto.categories = selectedCategories;
      }
    }

    try {
      const result = await createPresetsMutation.mutateAsync(createDto);
      
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Preset Templates Created',
          message: result.message
        });

        // Show detailed results if there were any skipped templates
        if (result.skippedTemplates.length > 0) {
          addToast({
            type: 'info',
            title: `${result.skippedTemplates.length} templates skipped`,
            message: 'Some templates already exist or could not be created'
          });
        }

        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to create preset templates:', error);
      addToast({
        type: 'error',
        title: 'Failed to Create Templates',
        message: 'An error occurred while creating preset templates'
      });
    }
  };

  const filteredTemplates = getFilteredTemplates();
  const canSubmit = generateAll || selectedTypes.length > 0 || selectedCategories.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Create Preset Email Templates</h3>
            <p className="text-sm text-gray-600 mt-1">
              Generate pre-built email templates to get started quickly
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {isLoadingPresets ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading available presets...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Generate All Option */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={generateAll}
                  onChange={(e) => handleGenerateAllChange(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-purple-900">
                  Generate all available preset templates ({presetsData?.templates.length || 0} templates)
                </span>
              </label>
              <p className="text-xs text-purple-700 mt-1 ml-6">
                This will create all predefined email templates at once
              </p>
            </div>

            {/* AI Generation Option */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={useAiGeneration}
                  onChange={(e) => setUseAiGeneration(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-0.5"
                />
                <div className="ml-2">
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 text-indigo-600 mr-1" />
                    <span className="text-sm font-medium text-indigo-900">
                      Use AI to Generate Enhanced Content
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700 mt-1">
                    AI will create detailed, professional email content tailored to each template type. 
                    This takes longer but provides higher quality, more comprehensive templates.
                  </p>
                </div>
              </label>
            </div>

            {!generateAll && (
              <>
                {/* Template Types Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Types
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {presetsData?.types.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => handleTypeChange(type)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {type.replace(/_/g, ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Categories Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {presetsData?.categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {category.replace(/_/g, ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm text-purple-600 hover:text-purple-700"
              >
                {showAdvanced ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                Advanced Options
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-4 border-l-2 border-purple-200 pl-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Scope
                    </label>
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="personal">Personal - Only visible to you</option>
                      <option value="team">Team - Visible to your team</option>
                      <option value="organization">Organization - Visible to your organization</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Template Preview */}
            {filteredTemplates.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  {showPreview ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                  Preview Templates ({filteredTemplates.length})
                </button>

                {showPreview && (
                  <div className="mt-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    <div className="space-y-2 p-3">
                      {filteredTemplates.map((template, index) => (
                        <div key={index} className="bg-gray-50 rounded p-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                            <div className="flex space-x-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {template.type.replace(/_/g, ' ')}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                {template.category}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                          <p className="text-xs text-gray-500 mt-1 font-mono">Subject: {template.subject}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-sm text-gray-600">
                {filteredTemplates.length > 0 ? (
                  <span className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                    {filteredTemplates.length} templates will be created
                  </span>
                ) : canSubmit ? (
                  <span className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                    No templates match your selection
                  </span>
                ) : (
                  <span className="text-gray-400">Select options to see preview</span>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || createPresetsMutation.isPending || filteredTemplates.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createPresetsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {useAiGeneration ? 'Generating with AI...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Create Templates
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PresetTemplatesDialog;

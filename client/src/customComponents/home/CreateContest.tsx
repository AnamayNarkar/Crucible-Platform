import React, { useState } from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { 
  Calendar, 
  Clock, 
  ImageIcon, 
  FileText, 
  Eye,
  Save,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Import the new component and the shared type
import EditContestDetails, { type ContestFormData } from './EditContestDetails';
import { createContest } from '@/services/api/contest';

const CreateContest = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContestFormData>({
    name: '',
    bannerImageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    cardDescription: '',
    markdownDescription: '# Contest Description\n\nWrite your contest details here using **Markdown**!\n\n## Rules\n- Rule 1\n- Rule 2\n\n## Prizes\n🥇 First Place: $1000\n🥈 Second Place: $500\n🥉 Third Place: $250',
    startTime: '',
    endTime: '',
  });

  // This handler is passed to the child component
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // This specific handler is for the MDEditor, passed to the child
  const handleMarkdownChange = (value: string | undefined) => {
    setFormData(prev => ({ ...prev, markdownDescription: value || '' }));
  };

  // This handler is passed to the child component
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Please enter a contest name');
      return;
    }
    if (!formData.cardDescription.trim()) {
      alert('Please enter a card description');
      return;
    }
    if (!formData.startTime) {
      alert('Please select a start time');
      return;
    }
    if (!formData.endTime) {
      alert('Please select an end time');
      return;
    }
    
    // Validate start time is before end time
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      alert('End time must be after start time');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the API to create the contest
      const result = await createContest({
        name: formData.name,
        bannerImageUrl: formData.bannerImageUrl,
        cardDescription: formData.cardDescription,
        markdownDescription: formData.markdownDescription,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
      console.log('Contest created successfully nigga:', result);
      
      if (result && result.data.id) {
        // Navigate to the manage contest page with the contest id
        navigate(`/contests/manage/${result.data.id}`);
      } else {
        alert('Failed to create contest. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Error creating contest:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      alert(message || 'Failed to create contest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-[1800px] min-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/contests')}
              className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-gray-200/50 text-gray-700 hover:text-gray-900 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <span>Create New Contest</span>
              </h1>
              <p className="text-gray-600 mt-1">Design your contest and inspire participants</p>
            </div>
          </div>
          <button
            onClick={handleSubmit} // This button can also trigger submit
            disabled={isSubmitting}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/40 transform hover:scale-105 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Publish Contest</span>
              </>
            )}
          </button>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Side - Form (Now the new component) */}
          <form onSubmit={handleSubmit}>
            <EditContestDetails
              formData={formData}
              handleInputChange={handleInputChange}
              onMarkdownChange={handleMarkdownChange}
              isCreator={true}
            />
          </form>

          {/* Right Side - Live Preview (Stays here) */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200/50 overflow-hidden shadow-xl shadow-gray-300/30">
              <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  <span>Live Preview</span>
                </h2>
                <p className="text-xs text-gray-600 mt-1">See how your contest will look</p>
              </div>

              <div className="p-6">
                {/* Preview Card */}
                <div className="bg-white rounded-2xl border border-gray-200/30 overflow-hidden shadow-lg hover:shadow-xl transition-all">
                  {/* Banner Preview */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                    {formData.bannerImageUrl ? (
                      <img
                        src={formData.bannerImageUrl}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-xl line-clamp-2">
                        {formData.name || 'Contest Name'}
                      </h3>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="p-5">
                    <p className="text-gray-700 text-sm line-clamp-2 mb-5">
                      {formData.cardDescription || 'Your short description will appear here...'}
                    </p>

                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-center space-x-2 text-sm text-gray-800">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>
                          {formData.startTime
                            ? new Date(formData.startTime).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Start Date'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-800">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>
                          {formData.startTime && formData.endTime
                            ? `${new Date(formData.startTime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })} - ${new Date(formData.endTime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}`
                            : 'Time Range'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                      <div className="text-sm text-gray-500">Preview</div>
                      <button className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/30 cursor-pointer">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Markdown Preview */}
                <div className="mt-6 bg-gray-50/50 rounded-xl border border-gray-200/50 p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>Description Preview</span>
                  </h3>
                  <div className="prose prose-sm max-w-none" data-color-mode="light">
                    <MarkdownPreview 
                      source={formData.markdownDescription || '*No description yet...*'} 
                      style={{ 
                        padding: '16px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        minHeight: '200px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContest;
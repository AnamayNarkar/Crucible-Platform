import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { 
  ImageIcon, 
  FileText, 
  Calendar, 
  Clock,
  Code
} from 'lucide-react';

// Define a type for the form data to share between components
export interface ContestFormData {
  name: string;
  bannerImageUrl: string;
  cardDescription: string;
  markdownDescription: string;
  startTime: string;
  endTime: string;
}

// Define the props for this component
interface EditContestDetailsProps {
  formData: ContestFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onMarkdownChange: (value: string | undefined) => void;
  isCreator: boolean;
}

const EditContestDetails: React.FC<EditContestDetailsProps> = ({
  formData,
  handleInputChange,
  onMarkdownChange,
  isCreator
}) => {
  const [startDate, setStartDate] = useState(formData.startTime ? formData.startTime.split('T')[0] : '');
  const [startTime, setStartTime] = useState(formData.startTime ? (formData.startTime.split('T')[1] || '00:00') : '00:00');
  const [endDate, setEndDate] = useState(formData.endTime ? formData.endTime.split('T')[0] : '');
  const [endTime, setEndTime] = useState(formData.endTime ? (formData.endTime.split('T')[1] || '00:00') : '00:00');

  useEffect(() => {
    setStartDate(formData.startTime.split('T')[0] || '');
    setStartTime(formData.startTime.split('T')[1] || '00:00');
  }, [formData.startTime]);

  useEffect(() => {
    setEndDate(formData.endTime.split('T')[0] || '');
    setEndTime(formData.endTime.split('T')[1] || '00:00');
  }, [formData.endTime]);

  return (
    // This is the entire "Left Side"
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-8 shadow-xl shadow-gray-300/30">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-500" />
          <span>Contest Details</span>
        </h2>

        {/* The form content without form wrapper - submit is handled by parent */}
        <div className="space-y-6">
          {/* Contest Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Contest Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter an exciting contest name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-white/50 placeholder:text-gray-400"
              required
              disabled={!isCreator}
            />
          </div>

          {/* Banner Image URL */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Banner Image URL *
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                name="bannerImageUrl"
                value={formData.bannerImageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/banner.jpg"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-white/50 placeholder:text-gray-400"
                required
                disabled={!isCreator}
              />
            </div>
          </div>

          {/* Card Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Short Description *
            </label>
            <textarea
              name="cardDescription"
              value={formData.cardDescription}
              onChange={handleInputChange}
              placeholder="Brief description for the contest card (max 150 characters)"
              rows={3}
              maxLength={150}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-white/50 placeholder:text-gray-400 resize-none"
              required
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.cardDescription.length}/150
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Start Date & Time *
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      handleInputChange({ target: { name: 'startTime', value: e.target.value + 'T' + startTime } } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                    required
                    disabled={!isCreator}
                  />
                </div>
                <div className="relative flex-1">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      handleInputChange({ target: { name: 'startTime', value: startDate + 'T' + e.target.value } } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                    required
                    disabled={!isCreator}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                End Date & Time *
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      handleInputChange({ target: { name: 'endTime', value: e.target.value + 'T' + endTime } } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                    required
                    disabled={!isCreator}
                  />
                </div>
                <div className="relative flex-1">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      handleInputChange({ target: { name: 'endTime', value: endDate + 'T' + e.target.value } } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                    required
                    disabled={!isCreator}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Markdown Editor */}
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200/50 overflow-hidden shadow-xl shadow-gray-300/30">
        <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <Code className="w-5 h-5 text-blue-500" />
            <span>Detailed Description (Markdown)</span>
          </h2>
        </div>
        <div className="p-6" data-color-mode="light">
          <MDEditor
            value={formData.markdownDescription}
            onChange={onMarkdownChange} // Use the prop
            preview="edit"
            height={500}
            visibleDragbar={false}
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgb(229 231 235)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditContestDetails;
import React, { useState } from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Eye, Code } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  height = 400,
  placeholder = 'Write your markdown here...',
}) => {
  const [activeView, setActiveView] = useState<'edit' | 'preview' | 'split'>('split');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setActiveView('edit')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeView === 'edit'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Code className="w-4 h-4 inline-block mr-1.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveView('preview')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeView === 'preview'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Eye className="w-4 h-4 inline-block mr-1.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveView('split')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeView === 'split'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Split
          </button>
        </div>
        <div className="text-xs text-gray-500">
          Markdown supported
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="flex" style={{ height: `${height}px` }}>
        {/* Editor */}
        {(activeView === 'edit' || activeView === 'split') && (
          <div className={`${activeView === 'split' ? 'w-1/2 border-r border-gray-300' : 'w-full'}`}>
            <textarea
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              className="w-full h-full p-4 font-mono text-sm resize-none outline-none focus:ring-0 border-0"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                lineHeight: '1.6',
              }}
            />
          </div>
        )}

        {/* Preview */}
        {(activeView === 'preview' || activeView === 'split') && (
          <div 
            className={`${activeView === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto bg-white`}
            data-color-mode="light"
          >
            <div className="p-4">
              <MarkdownPreview 
                source={value || '*No content yet...*'}
                style={{
                  backgroundColor: 'transparent',
                  color: '#374151',
                  fontSize: '14px',
                }}
                wrapperElement={{
                  'data-color-mode': 'light'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;

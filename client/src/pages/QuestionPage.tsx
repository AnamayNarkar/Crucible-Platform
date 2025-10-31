import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Editor } from '@monaco-editor/react';
import toast from 'react-hot-toast';
import type { Question } from '../services/types/questions';
import { getQuestion, submitForContest, submitForPractice } from '../services/api/question';
import { sleep } from '@/utils/sleep';

const QuestionPage = () => {
  const { contestId, problemId } = useParams<{ contestId?: string; problemId: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('// Write your code here\n');
  const [language, setLanguage] = useState('javascript');

  const isContestMode = !!contestId;

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!problemId) return;

      try {
        setLoading(true);
        const response = await getQuestion(Number(problemId));
        if (response && response.data) {
          setQuestion(response.data);
        } else {
          toast.error('Failed to fetch question');
        }
      } catch (error: any) {
        console.error('Error fetching question:', error);
        toast.error(error?.response?.data?.message || 'Failed to fetch question');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [problemId]);

  const handleSubmit = async () => {
    if (!problemId) return;

    try {
      if (isContestMode) {
        await submitForContest(Number(problemId), code, language);
        toast.success('Submitted for contest!');
      } else {
        await submitForPractice(Number(problemId), code, language);
        toast.success('Submitted for practice!');
      }
    } catch (error) {
      toast.error('Submission failed');
    }
  };

  const handleRun = () => {
    toast('Run functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Question not found</h2>
          <p className="text-gray-500 mt-2">
            The question you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Left Panel - Problem Description */}
      <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white">

        {/* Problem Description */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="prose prose-sm max-w-none">
            <MarkdownPreview
              source={question.markdownDescription}
              style={{
                backgroundColor: 'transparent',
                color: '#1f2937',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
              wrapperElement={{
                'data-color-mode': 'light',
              }}
            />
          </div>

          {/* Sample Test Cases Section */}
          {question.sampleTestCases && question.sampleTestCases.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Test Cases</h3>
              <div className="space-y-4">
                {question.sampleTestCases.map((testCase, index) => (
                  <div key={testCase.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Example {index + 1}
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Input:</p>
                        <pre className="text-sm bg-white px-3 py-2 rounded border border-gray-200 overflow-x-auto">
                          <code className="text-gray-800">{testCase.input.replace(/\\n/g, '\n')}</code>
                        </pre>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Expected Output:</p>
                        <pre className="text-sm bg-white px-3 py-2 rounded border border-gray-200 overflow-x-auto">
                          <code className="text-gray-800">{testCase.expectedOutput.replace(/\\n/g, '\n')}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Code Editor & Submission */}
      <div className="w-1/2 flex flex-col bg-gray-50">
        {/* Language Selector */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="go">Go</option>
          </select>
        </div>

      {/* Monaco Editor */}
      <div className="flex-1 bg-white relative">
        <div className="absolute inset-0">
          <Editor
            key={language}
            language={language}
            value={code}
            theme="light"
            onChange={(value) => setCode(value || '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false, // removes empty line below last line
              smoothScrolling: true,
              automaticLayout: true,
              tabSize: 2,
              cursorBlinking: 'smooth',
              wordWrap: 'on',
              lineNumbers: 'on',
              renderWhitespace: 'none',
              roundedSelection: true,
              fixedOverflowWidgets: true,
              renderValidationDecorations: 'on', // enables squiggly underlines
              renderFinalNewline: 'off',
              hideCursorInOverviewRuler: true,
              overviewRulerLanes: 0,
              guides: {
                indentation: false,
                highlightActiveIndentation: false,
              },

            }}
            beforeMount={async (monaco) => {
              // sleep for 5 ms
              await sleep(5);
              monaco.editor.defineTheme('light', {
                base: 'hc-light',
                inherit: true,
                rules: [
                  // Only red squiggly underline for errors, no background
                  { token: 'invalid', foreground: 'ff5555', fontStyle: 'underline wavy' },
                ],
                colors: {
                  'editor.background': '#ffffff',
                  'editorError.foreground': '#ff5555', // red underline
                  'editorWarning.foreground': '#f1fa8c',
                  'editorInfo.foreground': '#8be9fd',
                  'editorError.background': '#00000000', // transparent, removes red fill
                },
              });
              monaco.editor.setTheme('custom-dark');
            }}
            onMount={async (editor) => {
              editor.focus();
              await sleep(5);
              const container = editor.getContainerDomNode();
              container.style.height = '100%';
              container.style.pointerEvents = 'auto';
            }}
          />
        </div>
      </div>


        {/* Action Buttons */}
        <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center justify-end space-x-3">
          <button
            onClick={handleRun}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all hover:shadow-md"
          >
            Run Code
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40"
          >
            Submit
          </button>
        </div>

        {/* Results Section */}
        <div className="h-48 px-4 py-4 border-t border-gray-200 bg-white overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Test Results</h3>
          </div>

          {/* Placeholder for results */}
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">No submissions yet</span>
                <span className="text-gray-400">Click "Submit" to test your code</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;

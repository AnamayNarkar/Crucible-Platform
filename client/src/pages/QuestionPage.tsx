import { useEffect, useState, useRef } from 'react'; // Added useRef
import { useParams } from 'react-router-dom';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Editor } from '@monaco-editor/react';
import toast from 'react-hot-toast';
import type { Question, SubmissionResponse } from '../services/types/questions';
import { 
  getQuestion, 
  submitForContest, 
  submitForPractice,
  runCodeForContest,
  runCodeForPractice
} from '../services/api/question';
import { sleep } from '@/utils/sleep';

const QuestionPage = () => {
  const { contestId, problemId } = useParams<{ contestId?: string; problemId: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('// Write your code here\n');
  const [language, setLanguage] = useState('javascript');
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FIX: Refs for editor and container ---
  const editorRef = useRef<any>(null); // To hold the monaco editor instance
  const editorContainerRef = useRef<HTMLDivElement>(null); // To hold the DOM node

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

  // --- FIX: Add ResizeObserver to handle layout race conditions ---
  useEffect(() => {
    if (!editorContainerRef.current) return;

    // Create a ResizeObserver to watch the container
    const observer = new ResizeObserver(() => {
      if (editorRef.current) {
        // When the container resizes, tell the editor to layout
        setTimeout(() => {
          editorRef.current.layout();
        }, 0);
      }
    });

    // Start observing the container element
    observer.observe(editorContainerRef.current);

    // Cleanup: stop observing when the component unmounts
    return () => {
      observer.disconnect();
    };
  }, []); // Empty dependency array so this runs only once on mount

  const handleSubmit = async () => {
    if (!problemId) return;

    try {
      setIsSubmitting(true);
      setSubmissionResult(null);
      
      let response;
      if (isContestMode && contestId) {
        response = await submitForContest(Number(contestId), Number(problemId), code, language);
      } else {
        response = await submitForPractice(Number(problemId), code, language);
      }
      
      if (response && response.data) {
        setSubmissionResult(response.data);
        if (response.data.status === 'Accepted') {
          toast.success('All test cases passed! ✅');
        } else {
          toast.error(`${response.data.passedTestCases}/${response.data.totalTestCases} test cases passed`);
        }
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error?.response?.data?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRun = async () => {
    if (!problemId) return;

    try {
      setIsSubmitting(true);
      setSubmissionResult(null);
      
      let response;
      if (isContestMode && contestId) {
        response = await runCodeForContest(Number(contestId), Number(problemId), code, language);
      } else {
        response = await runCodeForPractice(Number(problemId), code, language);
      }
      
      if (response && response.data) {
        setSubmissionResult(response.data);
        if (response.data.status === 'Accepted') {
          toast.success('Sample test cases passed! ✅');
        } else {
          toast.error(`${response.data.passedTestCases}/${response.data.totalTestCases} sample test cases passed`);
        }
      }
    } catch (error: any) {
      console.error('Run error:', error);
      toast.error(error?.response?.data?.message || 'Code execution failed');
    } finally {
      setIsSubmitting(false);
    }
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
                          <code className="text-gray-800 whitespace-pre-wrap">{testCase.input?.replace(/\\n/g, '\n')}</code>
                        </pre>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Expected Output:</p>
                        <pre className="text-sm bg-white px-3 py-2 rounded border border-gray-200 overflow-x-auto">
                          <code className="text-gray-800 whitespace-pre-wrap">{testCase.expectedOutput?.replace(/\\n/g, '\n')}</code>
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
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="go">Go</option>
          </select>
        </div>

      {/* Monaco Editor */}
      {/* --- FIX: Add ref to the container --- */}
      <div className="flex-1 bg-white relative" ref={editorContainerRef}>
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
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              automaticLayout: true, // This is still useful as a fallback
              tabSize: 2,
              cursorBlinking: 'smooth',
              wordWrap: 'on',
              lineNumbers: 'on',
              renderWhitespace: 'none',
              roundedSelection: true,
              fixedOverflowWidgets: true,
              renderValidationDecorations: 'on',
              renderFinalNewline: 'off',
              hideCursorInOverviewRuler: true,
              overviewRulerLanes: 0,
              guides: {
                indentation: false,
                highlightActiveIndentation: false,
              },

            }}
            beforeMount={async (monaco) => {
              await sleep(5); // Keep this, it can help with theme loading
              monaco.editor.defineTheme('light', {
                base: 'hc-light',
                inherit: true,
                rules: [
                  { token: 'invalid', foreground: 'ff5555', fontStyle: 'underline wavy' },
                ],
                colors: {
                  'editor.background': '#ffffff',
                  'editorError.foreground': '#ff5555',
                  'editorWarning.foreground': '#f1fa8c',
                  'editorInfo.foreground': '#8be9fd',
                  'editorError.background': '#00000000',
                },
              });
              monaco.editor.setTheme('light');
            }}
            // --- FIX: Store editor instance in ref onMount ---
            onMount={(editor) => {
              editorRef.current = editor;
              editor.focus();
              // No need for setTimeout(layout) here, the observer will handle it
            }}
          />
        </div>
      </div>


        {/* Action Buttons */}
        <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center justify-end space-x-3">
          <button
            onClick={handleRun}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Running...' : 'Run Code'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {/* Results Section */}
        {/* --- CHANGE: Increased height from h-48 to h-72 --- */}
        <div className="h-72 px-4 py-4 border-t border-gray-200 bg-white overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {submissionResult?.isRun ? 'Run Results' : 'Submission Results'}
            </h3>
            {submissionResult && (
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                submissionResult.status === 'Accepted' 
                  ? 'bg-green-100 text-green-700' 
                  : submissionResult.status === 'Partial'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {submissionResult.status}
              </span>
            )}
          </div>

          {/* Results Display */}
          {!submissionResult ? (
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">No submissions yet</span>
                  <span className="text-gray-400">Click "Run" or "Submit" to test your code</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary */}
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Test Cases</span>
                  <span className={`font-semibold ${
                    submissionResult.passedTestCases === submissionResult.totalTestCases
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {submissionResult.passedTestCases}/{submissionResult.totalTestCases} passed
                  </span>
                </div>
                {submissionResult.isRun && (
                  <p className="text-xs text-gray-500">
                    Running sample test cases only. Click "Submit" to test against all test cases.
                  </p>
                )}
              </div>

              {/* Individual Test Case Results */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {submissionResult.testCaseResults && submissionResult.testCaseResults.length > 0 ? (
                  submissionResult.testCaseResults.map((testCase) => (
                    <div 
                      key={testCase.testCaseNumber} 
                      className={`p-3 rounded-lg border ${
                        testCase.passed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700">
                          Test Case {testCase.testCaseNumber}
                          {testCase.isSample && <span className="ml-1 text-blue-600">(Sample)</span>}
                        </span>
                        <span className={`text-xs font-bold ${
                          testCase.passed ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {testCase.passed ? '✓ PASS' : '✗ FAIL'}
                        </span>
                      </div>
                      
                      {!testCase.passed && (
                        <div className="space-y-2 text-xs">
                          {testCase.errorMessage ? (
                            <div>
                              <p className="font-medium text-red-700 mb-1">Error:</p>
                              <pre className="bg-white px-2 py-1 rounded border border-red-300 overflow-x-auto">
                                <code className="whitespace-pre-wrap text-red-800">{testCase.errorMessage?.replace(/\\n/g, '\n')}</code>
                              </pre>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="font-medium text-gray-600 mb-1">Input:</p>
                                <pre className="bg-white px-2 py-1 rounded border border-gray-300 overflow-x-auto">
                                  <code className="whitespace-pre-wrap text-gray-800">{testCase.input?.replace(/\\n/g, '\n')}</code>
                                </pre>
                              </div>
                              <div>
                                <p className="font-medium text-gray-600 mb-1">Expected:</p>
                                <pre className="bg-white px-2 py-1 rounded border border-gray-300 overflow-x-auto">
                                  <code className="whitespace-pre-wrap text-gray-800">{testCase.expectedOutput?.replace(/\\n/g, '\n')}</code>
                                </pre>
                              </div>
                              <div>
                                <p className="font-medium text-gray-600 mb-1">Your Output:</p>
                                <pre className="bg-white px-2 py-1 rounded border border-gray-300 overflow-x-auto">
                                  <code className="whitespace-pre-wrap text-gray-800">{(testCase.actualOutput || '(no output)').replace(/\\n/g, '\n')}</code>
                                </pre>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : submissionResult.output ? (
                  <div className="p-3 rounded-lg border bg-gray-50 border-gray-200">
                    <p className="font-medium text-gray-700 mb-2 text-sm">Test Results:</p>
                    <pre className="bg-white px-3 py-2 rounded border border-gray-300 overflow-x-auto text-xs">
                      <code className="text-gray-800 whitespace-pre-wrap">{submissionResult.output?.replace(/\\n/g, '\n')}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border bg-gray-50 border-gray-200">
                    <p className="text-sm text-gray-500">No detailed test case results available.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;
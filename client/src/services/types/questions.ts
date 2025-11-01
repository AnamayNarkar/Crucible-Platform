
export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
}

export interface Question {
  id: number;
  title: string;
  markdownDescription: string;
  points: number;
  creatorId: number;
  contestId: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  sampleTestCases: TestCase[];
}

export interface QuestionResponse {
  data: Question;
  message?: string;
}

export interface TestCaseResult {
  testCaseNumber: number;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  errorMessage?: string;
  isSample: boolean;
}

export interface SubmissionResponse {
  submissionId?: number | null;
  status: string; // "Accepted", "Wrong Answer", "Runtime Error", "Time Limit Exceeded", "Compilation Error"
  output: string;
  passedTestCases: number;
  totalTestCases: number;
  isRun: boolean;
  testCaseResults: TestCaseResult[];
}

export interface SubmissionApiResponse {
  data: SubmissionResponse;
  message?: string;
}

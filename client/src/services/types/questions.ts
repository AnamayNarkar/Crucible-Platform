
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

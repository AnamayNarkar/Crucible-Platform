import axiosInstance from './axiosInstance';
import type { QuestionResponse, SubmissionApiResponse } from '../types/questions';

export const getQuestion = async (questionId: number): Promise<QuestionResponse> => {
  const response = await axiosInstance.get(`/questions/${questionId}`);
  return response.data;
};

// Run code with sample test cases only (practice mode)
export const runCodeForPractice = async (
  questionId: number,
  code: string,
  language: string
): Promise<SubmissionApiResponse> => {
  const response = await axiosInstance.post('/submissions/submit', {
    questionId,
    code,
    language,
    isRun: true,
  });
  return response.data;
};

// Submit code with all test cases (practice mode)
export const submitForPractice = async (
  questionId: number,
  code: string,
  language: string
): Promise<SubmissionApiResponse> => {
  const response = await axiosInstance.post('/submissions/submit', {
    questionId,
    code,
    language,
    isRun: false,
  });
  return response.data;
};

// Run code with sample test cases only (contest mode)
export const runCodeForContest = async (
  contestId: number,
  questionId: number,
  code: string,
  language: string
): Promise<SubmissionApiResponse> => {
  const response = await axiosInstance.post('/submissions/contest', {
    contestId,
    questionId,
    code,
    language,
    isRun: true,
  });
  return response.data;
};

// Submit code with all test cases (contest mode)
export const submitForContest = async (
  contestId: number,
  questionId: number,
  code: string,
  language: string
): Promise<SubmissionApiResponse> => {
  const response = await axiosInstance.post('/submissions/contest', {
    contestId,
    questionId,
    code,
    language,
    isRun: false,
  });
  return response.data;
};

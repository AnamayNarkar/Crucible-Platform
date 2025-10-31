import axiosInstance from './axiosInstance';
import type { QuestionResponse } from '../types/questions';

export const getQuestion = async (questionId: number): Promise<QuestionResponse> => {
  const response = await axiosInstance.get(`/questions/${questionId}`);
  return response.data;
};

export const submitForContest = async (questionId: number, code: string, language: string) => {
  console.log('Submitting for contest:', { questionId, code, language });
  // TODO: Implement actual submission logic
};

export const submitForPractice = async (questionId: number, code: string, language: string) => {
  console.log('Submitting for practice:', { questionId, code, language });
  // TODO: Implement actual submission logic
};

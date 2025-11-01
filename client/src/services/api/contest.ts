import axiosInstance from "./axiosInstance";
import { handleApiError } from "./errorHandling";
import type { Contest, ContestDetailsForUser, ContestQuestionsResponse, ContestLeaderboardResponse } from "../types/contest";
import type { ManageContestResponse } from "../types/manageContest";

export interface CreateContestPayload {
  name: string;
  bannerImageUrl: string;
  cardDescription: string;
  markdownDescription: string;
  startTime: string;
  endTime: string;
}

export interface UpdateContestPayload {
  name?: string;
  bannerImageUrl?: string;
  cardDescription?: string;
  markdownDescription?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * Create a new contest
 * @param contestData - The contest data to create
 * @returns The created contest object with id
 */

type CreatedContestResponse = {
  message: string;
  data: Contest;
};

export async function createContest(contestData: CreateContestPayload): Promise<CreatedContestResponse | null> {
  try {
    const response = await axiosInstance.post('/contests', contestData);
    return response.data;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to create contest');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Get all contests (ongoing, upcoming, past)
 */
export async function getAllContests(): Promise<{
  ongoing: Contest[];
  upcoming: Contest[];
  past: Contest[];
} | null> {
  try {
    const response = await axiosInstance.get('/contests');
    return response.data;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to fetch contests');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Get ongoing/live contests
 */
export async function getLiveContests(): Promise<Contest[] | null> {
  try {
    const response = await axiosInstance.get('/contests/live');
    return response.data.data as Contest[];
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to fetch live contests');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Get upcoming contests
 */
export async function getUpcomingContests(): Promise<Contest[] | null> {
  try {
    const response = await axiosInstance.get('/contests/upcoming');
    return response.data.data as Contest[];
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to fetch upcoming contests');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Get past contests
 */
export async function getPastContests(): Promise<Contest[] | null> {
  try {
    const response = await axiosInstance.get('/contests/past');
    return response.data.data as Contest[];
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to fetch past contests');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Get user's contests
 */
export async function getUserContests(): Promise<Contest[] | null> {
  try {
    const response = await axiosInstance.get('/contests/user');
    return response.data.data as Contest[];
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to fetch user contests');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Get a single contest by ID
 * @param contestId - The contest ID
 */
export async function getContestById(contestId: number): Promise<ContestDetailsForUser | null> {
  try {
    const response = await axiosInstance.get(`/contests/${contestId}`);
    return response.data.data as ContestDetailsForUser;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to fetch contest');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Get contest questions for participants
 * @param contestId - The contest ID
 */
export async function getContestQuestions(contestId: number): Promise<ContestQuestionsResponse | null> {
  try {
    const response = await axiosInstance.get(`/contests/${contestId}/questions`);
    return response.data.data as ContestQuestionsResponse;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to fetch contest questions');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Update a contest
 * @param contestId - The contest ID
 * @param contestData - The contest data to update
 */
export async function updateContest(
  contestId: number,
  contestData: UpdateContestPayload
): Promise<{ message: string; data: Contest } | null> {
  try {
    const response = await axiosInstance.put(`/contests/${contestId}`, contestData);
    return response.data;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to update contest');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Delete a contest
 * @param contestId - The contest ID
 */
export async function deleteContest(contestId: number): Promise<boolean> {
  try {
    await axiosInstance.delete(`/contests/${contestId}`);
    return true;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to delete contest');
    if (result && 'isServerDown' in result) {
      return false;
    }
    throw error;
  }
}

/**
 * Participate in a contest
 * @param contestId - The contest ID
 */
export async function participateInContest(contestId: number): Promise<{ message: string } | null> {
  try {
    const response = await axiosInstance.post(`/contests/${contestId}/participate`);
    return response.data;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to participate in contest');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Get contest leaderboard
 * @param contestId - The contest ID
 */
export async function getContestLeaderboard(contestId: number): Promise<ContestLeaderboardResponse | null> {
  try {
    const response = await axiosInstance.get(`/contests/${contestId}/leaderboard`);
    return response.data.data;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to fetch contest leaderboard');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Get manage contest data (contest details, admins, questions)
 * @param contestId - The contest ID
 */
export async function getManageContestData(contestId: number): Promise<ManageContestResponse | null> {
  try {
    const response = await axiosInstance.get(`/contests/manage/${contestId}`);
    return response.data;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to fetch manage contest data');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Add admin to contest by email
 * @param contestId - The contest ID
 * @param email - The admin's email
 */
export async function addAdminToContest(contestId: number, email: string): Promise<boolean> {
  try {
    await axiosInstance.post('/admin', { 
      contestId, 
      email 
    });
    return true;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to add admin to contest');
    if (result && 'isServerDown' in result) {
      return false;
    }
    throw error;
  }
}

/**
 * Remove admin from contest
 * @param contestId - The contest ID
 * @param email - The admin's email
 */
export async function removeAdminFromContest(contestId: number, email: string): Promise<boolean> {
  try {
    await axiosInstance.delete('/admin', { 
      data: {
        contestId,
        email
      }
    });
    return true;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to remove admin from contest');
    if (result && 'isServerDown' in result) {
      return false;
    }
    throw error;
  }
}

// ==================== Question APIs ====================

export interface CreateQuestionPayload {
  title: string;
  markdownDescription: string;
  points: number;
  contestId: number;
}

export interface UpdateQuestionPayload {
  title: string;
  markdownDescription: string;
  points: number;
}

export interface Question {
  id: number;
  title: string;
  markdownDescription: string;
  points: number;
  creatorId: number;
  contestId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a new question
 * @param questionData - The question data to create
 */
export async function createQuestion(questionData: CreateQuestionPayload): Promise<{ message: string; data: Question } | null> {
  try {
    const response = await axiosInstance.post('/questions', questionData);
    return response.data;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to create question');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Get a question by ID
 * @param questionId - The question ID
 */
export async function getQuestion(questionId: number): Promise<{ message: string; data: Question } | null> {
  try {
    const response = await axiosInstance.get(`/questions/${questionId}`);
    return response.data;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to fetch question');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Update a question
 * @param questionId - The question ID
 * @param questionData - The question data to update
 */
export async function updateQuestion(
  questionId: number,
  questionData: UpdateQuestionPayload
): Promise<{ message: string; data: Question } | null> {
  try {
    const response = await axiosInstance.put(`/questions/${questionId}`, questionData);
    return response.data;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to update question');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Delete a question
 * @param questionId - The question ID
 */
export async function deleteQuestion(questionId: number): Promise<boolean> {
  try {
    await axiosInstance.delete(`/questions/${questionId}`);
    return true;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to delete question');
    if (result && 'isServerDown' in result) {
      return false;
    }
    throw error;
  }
}

// ==================== Test Case APIs ====================

export interface TestCase {
  id: number;
  questionId: number;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestCasePayload {
  questionId: number;
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

export interface UpdateTestCasePayload {
  questionId: number;
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

/**
 * Create a new test case
 * @param testCaseData - The test case data to create
 */
export async function createTestCase(testCaseData: CreateTestCasePayload): Promise<{ message: string; data: TestCase } | null> {
  try {
    const response = await axiosInstance.post('/test-cases', testCaseData);
    return response.data;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to create test case');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Get all test cases for a question
 * @param questionId - The question ID
 */
export async function getTestCasesByQuestion(questionId: number): Promise<{ message: string; data: TestCase[] } | null> {
  try {
    const response = await axiosInstance.get(`/test-cases/question/${questionId}`);
    return response.data;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to fetch test cases');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Update a test case
 * @param testCaseId - The test case ID
 * @param testCaseData - The test case data to update
 */
export async function updateTestCase(
  testCaseId: number,
  testCaseData: UpdateTestCasePayload
): Promise<{ message: string; data: TestCase } | null> {
  try {
    const response = await axiosInstance.put(`/test-cases/${testCaseId}`, testCaseData);
    return response.data;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to update test case');
    if (result && 'isServerDown' in result) {
      return null;
    }
    throw error;
  }
}

/**
 * Delete a test case
 * @param testCaseId - The test case ID
 */
export async function deleteTestCase(testCaseId: number): Promise<boolean> {
  try {
    await axiosInstance.delete(`/test-cases/${testCaseId}`);
    return true;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to delete test case');
    if (result && 'isServerDown' in result) {
      return false;
    }
    throw error;
  }
}

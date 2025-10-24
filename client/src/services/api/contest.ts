import axiosInstance from "./axiosInstance";
import { handleApiError } from "./errorHandling";
import type { Contest } from "../types/contest";
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
 * Get user's contests
 */
export async function getUserContests(): Promise<Contest[] | null> {
  try {
    const response = await axiosInstance.get('/contests/user');
    return response.data as Contest[];
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
export async function getContestById(contestId: number): Promise<Contest | null> {
  try {
    const response = await axiosInstance.get(`/contests/${contestId}`);
    return response.data as Contest;
  } catch (error: any) {
    const result = handleApiError(error, 'Failed to fetch contest');
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

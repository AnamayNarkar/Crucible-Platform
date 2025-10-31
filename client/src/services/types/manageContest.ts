import {type Question } from './questions';

export interface Contest {
  id: number;
  name: string;
  bannerImageUrl: string;
  cardDescription: string;
  markdownDescription: string;
  creatorId: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummaryDto {
  id: string;
  username: string;
  email: string;
}

export interface ManageContestData {
  contest: Contest;
  admins: UserSummaryDto[];
  questions: Question[];
}

export interface ManageContestResponse {
  success: boolean;
  data: ManageContestData;
}
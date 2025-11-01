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

export interface ContestDetailsForUser extends Contest {
  hasUserParticipated: boolean;
}

export interface ContestQuestion {
  id: number;
  title: string;
  points: number;
  hasAttempted: boolean;
  hasSolved: boolean;
}

export interface ContestQuestionsResponse {
  contestId: number;
  contestName: string;
  hasParticipated: boolean;
  questions: ContestQuestion[];
}

export interface LeaderboardEntry {
  userId: number;
  username: string;
  totalScore: number;
  solvedProblems: number;
  rank: number;
}

export interface ContestLeaderboardResponse {
  contestId: number;
  contestName: string;
  leaderboard: LeaderboardEntry[];
}

export interface ContestsState {
  userContests: Contest[];
  ongoingContests: Contest[];
  upcomingContests: Contest[];
  pastContests: Contest[];
  loading: boolean;
  error: string | null;
}
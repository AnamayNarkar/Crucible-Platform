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

export interface ContestsState {
  userContests: Contest[];
  ongoingContests: Contest[];
  upcomingContests: Contest[];
  pastContests: Contest[];
  loading: boolean;
  error: string | null;
}

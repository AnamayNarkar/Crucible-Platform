
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
}

export interface QuestionResponse {
  data: Question;
  message?: string;
}

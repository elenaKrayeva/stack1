export type ApiUser = {
  id: number | string;
  username: string;
  role?: string;
};

export type ApiAnswer = {
  id: number | string;
  content: string;
  isCorrect: boolean;
  user?: ApiUser | null;
};

export type ApiQuestion = {
  id: number | string;
  title: string;
  description?: string;
  attachedCode?: string;
  isResolved?: boolean;
  answers?: ApiAnswer[];
  user?: ApiUser | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Answer = {
  id: number;
  content: string;
  isCorrect: boolean;
  author: {
    id: number;
    username: string;
    role?: string;
  };
};

export type Question = {
  id: number;
  title: string;
  body?: string;
  code?: string;
  resolved: boolean;
  answers: Answer[];
  answersCount: number;
  author: {
    id: number;
    username: string;
    role?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type ApiQuestionsResponse = {
  data: ApiQuestion[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links: {
    first?: string | null;
    previous?: string | null;
    next?: string | null;
    last?: string | null;
  };
};

export type QuestionsPageResult = {
  items: Question[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  nextPage?: number;
};

export type CreateQuestionDto = {
  title: string;
  description?: string;
  attachedCode?: string;
};

export type ApiCreateQuestionResponse = ApiQuestion

export type CreateAnswerDto = {
  content: string;
  questionId: number;
};

export type UpdateQuestionDto = {
  title: string;
  description?: string;
  attachedCode?: string;
};

export type UpdateQuestionResponse = ApiQuestion;
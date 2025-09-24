export type UserRole = "user" | "admin";

export type ApiUser = {
  id: number | string;
  username: string;
  role?: string;
};

export type User = {
  id: number;
  username: string;
  role: string;
};

export type ApiUsersResponse = {
  data: ApiUser[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    sortBy?: [string, "ASC" | "DESC"][];
    searchBy?: string[];
    search?: string;
  };
  links: {
    first?: string | null;
    previous?: string | null;
    current?: string | null;
    next?: string | null;
    last?: string | null;
  };
};

export type ApiUserStatistic = Partial<
  Record<
    | "snippets"
    | "snippetsCount"
    | "questions"
    | "questionsCount"
    | "answers"
    | "answersCount"
    | "likes"
    | "likesCount"
    | "dislikes"
    | "dislikesCount"
    | "comments"
    | "commentsCount"
    | "correctAnswersCount"
    | "regularAnswersCount"
    | "rating",
    number | string
  >
>;

export type UserStatistic = {
  snippetsCount: number;
  questionsCount: number;
  answersCount: number;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  rating: number;
};

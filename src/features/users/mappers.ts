import type { ApiUser, User, ApiUserStatistic, UserStatistic } from "./types";
import { convertToNumber } from "@/shared/utils/number";

export const mapApiUser = (apiUser: ApiUser): User => ({
  id: convertToNumber(apiUser.id),
  username: apiUser.username,
  role: String((apiUser as any).role ?? ""),
});

const convertToNumberOrZero = (
  value: number | string | undefined | null
): number => {
  if (value === null || value === undefined || value === "") return 0;
  try {
    return convertToNumber(value as any);
  } catch {
    return 0;
  }
};

export const mapApiUserStatistic = (
  apiStatistic: ApiUserStatistic | undefined
): UserStatistic => {
  const correctAnswersCount = convertToNumberOrZero(
    apiStatistic?.correctAnswersCount
  );
  const regularAnswersCount = convertToNumberOrZero(
    apiStatistic?.regularAnswersCount
  );
  const answersCountFromParts = correctAnswersCount + regularAnswersCount;

  return {
    snippetsCount: convertToNumberOrZero(
      apiStatistic?.snippetsCount ?? apiStatistic?.snippets
    ),
    questionsCount: convertToNumberOrZero(
      apiStatistic?.questionsCount ?? apiStatistic?.questions
    ),
    answersCount:
      convertToNumberOrZero(
        apiStatistic?.answersCount ?? apiStatistic?.answers
      ) || answersCountFromParts,
    likesCount: convertToNumberOrZero(
      apiStatistic?.likesCount ?? apiStatistic?.likes
    ),
    dislikesCount: convertToNumberOrZero(
      apiStatistic?.dislikesCount ?? apiStatistic?.dislikes
    ),
    commentsCount: convertToNumberOrZero(
      apiStatistic?.commentsCount ?? apiStatistic?.comments
    ),
    rating: convertToNumberOrZero(apiStatistic?.rating),
  };
};

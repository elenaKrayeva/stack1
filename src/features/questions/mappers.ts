import type { ApiQuestion, ApiAnswer, Question, Answer } from "./types";
import { convertToNumber } from "@/shared/utils/number";

const answerHasUser = (
  apiAnswer: ApiAnswer
): apiAnswer is ApiAnswer & { user: NonNullable<ApiAnswer["user"]> } => {
  return Boolean(
    apiAnswer &&
      apiAnswer.user &&
      apiAnswer.user.id != null &&
      apiAnswer.user.username != null
  );
};

export const mapApiAnswerToDomainAnswer = (apiAnswer: ApiAnswer): Answer | null => {
  if (!answerHasUser(apiAnswer)) return null;
  return {
    id: convertToNumber(apiAnswer.id),
    content: apiAnswer.content,
    isCorrect: apiAnswer.isCorrect,
    author: {
      id: convertToNumber(apiAnswer.user.id),
      username: apiAnswer.user.username,
      role: apiAnswer.user.role,
    },
  };
};

export const mapApiQuestionToDomainQuestion = (apiQuestion: ApiQuestion): Question => {
  const answersCountFromArray = Array.isArray(apiQuestion.answers)
    ? apiQuestion.answers.length
    : 0;

  const mappedAnswers = Array.isArray(apiQuestion.answers)
    ? apiQuestion.answers.filter(answerHasUser).map((apiAnswer) => ({
        id: convertToNumber(apiAnswer.id),
        content: apiAnswer.content,
        isCorrect: apiAnswer.isCorrect,
        author: {
          id: convertToNumber(apiAnswer.user.id),
          username: apiAnswer.user.username,
          role: apiAnswer.user.role,
        },
      }))
    : [];

  const mappedAuthor = apiQuestion.user
    ? {
        id: convertToNumber(apiQuestion.user.id),
        username: apiQuestion.user.username,
        role: apiQuestion.user.role,
      }
    : {
        id: 0,
        username: "unknown",
        role: undefined,
      };

  return {
    id: convertToNumber(apiQuestion.id),
    title: apiQuestion.title,
    body: apiQuestion.description ?? undefined,
    code: apiQuestion.attachedCode,
    resolved: Boolean(apiQuestion.isResolved),
    answers: mappedAnswers,
    answersCount: answersCountFromArray,
    author: mappedAuthor,
    createdAt: apiQuestion.createdAt,
    updatedAt: apiQuestion.updatedAt,
  };
};

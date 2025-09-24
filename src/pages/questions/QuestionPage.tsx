import { useParams } from "react-router-dom";
import {
  Box,
  Chip,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Button,
  TextField,
} from "@mui/material";
import { useQuestion, useMarkAnswerState, useCreateAnswer } from "@/features/questions/queries";
import { useState } from "react";
import { useAuthStore } from "@/features/auth/model/store";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const answerSchema = z.object({
  content: z.string().min(2, "Minimum 2 characters").max(20000, "Too long"),
});
type AnswerFormValues = z.infer<typeof answerSchema>;

export const QuestionPage = () => {
  const params = useParams();
  const id = Number(params.id);
  const { data, isLoading, isError, error } = useQuestion(id);

  const currentUser = useAuthStore((state) => state.user);
  const canResolve =
    !!currentUser &&
    (currentUser.id === data?.author.id ||
      ["admin"].includes(currentUser.role ?? ""));

  const { mutateAsync: markState } = useMarkAnswerState();
  const [pendingId, setPendingId] = useState<number | null>(null);

  const { mutateAsync: createAnswer, isPending: isCreating } = useCreateAnswer();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AnswerFormValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: { content: "" },
  });

  if (isLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <CircularProgress size={24} />
      </Container>
    );
  }
  if (isError) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error">
          Error: {error instanceof Error ? error.message : "unknown"}
        </Typography>
      </Container>
    );
  }
  if (!data) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Question not found</Typography>
      </Container>
    );
  }

  const handleMark = async (answerId: number, to: "correct" | "incorrect") => {
    try {
      setPendingId(answerId);
      await markState({ questionId: data.id, answerId, state: to });
    } finally {
      setPendingId(null);
    }
  };

  const onSubmitAnswer = async (values: AnswerFormValues) => {
    await createAnswer({ content: values.content.trim(), questionId: data.id });
    reset({ content: "" });
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Typography variant="h4">{data.title}</Typography>
        {data.resolved && <Chip label="Resolved" size="small" color="success" />}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Author: {data.author.username}
        {data.createdAt ? ` · ${new Date(data.createdAt).toLocaleString()}` : ""}
      </Typography>

      {data.body && (
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
          {data.body}
        </Typography>
      )}

      {data.code && (
        <Box
          component="pre"
          sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1, overflow: "auto", fontSize: "0.95rem", mb: 2 }}
        >
          <code>{data.code}</code>
        </Box>
      )}

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Your answer
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmitAnswer)}>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Write a helpful, complete answer…"
                  fullWidth
                  multiline
                  minRows={4}
                  error={!!errors.content}
                  helperText={errors.content?.message}
                />
              )}
            />
            <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
              <Button type="submit" variant="contained" disabled={isCreating}>
                {isCreating ? "Posting…" : "Post answer"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
        Answers ({data.answersCount ?? data.answers?.length ?? 0})
      </Typography>

      {(data.answers?.length ?? 0) === 0 ? (
        <Typography color="text.secondary">No answers yet</Typography>
      ) : (
        <Stack spacing={2}>
          {(data.answers ?? []).map((ans) => {
            const isCorrect = ans.isCorrect;
            const isPending = pendingId === ans.id;

            return (
              <Card
                key={ans.id}
                variant="outlined"
                sx={{ borderColor: isCorrect ? "success.main" : undefined }}
              >
                <CardContent>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 1 }}>
                    {ans.content}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography variant="caption" color="text.secondary">
                      Author: {ans.author.username}
                    </Typography>
                    {isCorrect && <Chip label="Correct" size="small" color="success" />}

                    {canResolve && (
                      <Box sx={{ ml: "auto" }}>
                        {isCorrect ? (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleMark(ans.id, "incorrect")}
                            disabled={isPending}
                          >
                            {isPending ? "Updating…" : "Unmark"}
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleMark(ans.id, "correct")}
                            disabled={isPending}
                          >
                            {isPending ? "Updating…" : "Mark as correct"}
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  );
};

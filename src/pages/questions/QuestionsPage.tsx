import { useMemo, useRef, useEffect, Fragment } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuestionsInfinite } from "@/features/questions/queries";
import { QuestionCard } from "@/features/questions/components/QuestionCard";

export const QuestionsPage = () => {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useQuestionsInfinite({
    limit: 20,
  });

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        fetchNextPage();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          gap={2}
        >
          <CircularProgress size={24} />
          <Typography>Loading…</Typography>
        </Stack>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error" fontWeight={600}>
          Loading error: {error instanceof Error ? error.message : "unknown"}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Questions
      </Typography>

      {items.length === 0 ? (
        <Typography color="text.secondary">No questions yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {items.map((question) => (
            <Fragment key={question.id}>
              <QuestionCard
                question={question}
                onClick={(id) => navigate(`/questions/${id}`)}
              />
            </Fragment>
          ))}
        </Stack>
      )}

      <Box ref={sentinelRef} sx={{ height: 8 }} />

      {hasNextPage && (
        <Box textAlign="center" mt={2}>
          <Button
            variant="outlined"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            startIcon={
              isFetchingNextPage ? <CircularProgress size={16} /> : null
            }
          >
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        </Box>
      )}
    </Container>
  );
};

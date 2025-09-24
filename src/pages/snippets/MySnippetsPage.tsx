import { useCallback, useEffect, useMemo, useRef } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useSnippetsInfinite } from "@/features/snippets/queries";
import { useAuthStore } from "@/features/auth/model/store";
import { SnippetCard } from "@/widgets/Snippet/SnippetCard";

const PAGE_LIMIT_DEFAULT = 20;

const getUserIdNumber = (
  rawId: string | number | undefined | null
): number | undefined => {
  if (rawId == null) return undefined;
  const num = typeof rawId === "string" ? Number(rawId) : rawId;
  return Number.isFinite(num) ? (num as number) : undefined;
};

const IO_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: "400px",
  threshold: 0,
};

export const MySnippetsPage = () => {
  const authenticatedUser = useAuthStore((state) => state.user);
  const myUserId = useMemo(
    () => getUserIdNumber(authenticatedUser?.id),
    [authenticatedUser?.id]
  );

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useSnippetsInfinite({
    limit: PAGE_LIMIT_DEFAULT,
    userId: myUserId,
  });

  const handleIntersect: IntersectionObserverCallback = useCallback(
    (entries) => {
      const first = entries[0];
      if (!first?.isIntersecting) return;
      if (hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(handleIntersect, IO_OPTIONS);
    observer.observe(element);
    return () => observer.disconnect();
  }, [handleIntersect]);

  if (!authenticatedUser) {
    return (
      <Typography color="error">
        You must be logged in to view this page.
      </Typography>
    );
  }

  if (status === "pending") {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === "error") {
    return (
      <Typography color="error">
        {(error as Error)?.message ?? "Failed to load your snippets"}
      </Typography>
    );
  }

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];
  const hasItems = allItems.length > 0;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        My snippets
      </Typography>

      {!hasItems && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You have not posted any snippets yet.
        </Typography>
      )}

      {allItems.map((snippet) => (
        <SnippetCard key={snippet.id} snippet={snippet} />
      ))}

      <div ref={sentinelRef} />

      {isFetchingNextPage && (
        <Box sx={{ display: "grid", placeItems: "center", py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!hasNextPage && hasItems && (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ py: 2 }}
        >
          You've reached the end.
        </Typography>
      )}
    </Box>
  );
};

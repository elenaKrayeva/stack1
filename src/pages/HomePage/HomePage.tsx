import { useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSnippetsInfinite } from '@/features/snippets/queries';
import { SnippetCard } from '@/widgets/Snippet/SnippetCard';

export const HomePage = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } =
    useSnippetsInfinite({
      limit: 20,
      sortBy: ['id:DESC'],
    });

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage) return;
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, { rootMargin: '400px' });

    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Typography color="error">
        {(error as Error)?.message ?? 'Failed to load'}
      </Typography>
    );
  }

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Box>
      {items.map((snippet) => (
        <SnippetCard key={snippet.id} snippet={snippet} />
      ))}

      <div ref={sentinelRef} />

      {isFetchingNextPage && (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!hasNextPage && items.length > 0 && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
          You've reached the end.
        </Typography>
      )}
    </Box>
  );
}

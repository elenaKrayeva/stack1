import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  ListItemButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useUsersInfinite } from "@/features/users/queries";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

const IO_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: "400px",
  threshold: 0,
};

export const UsersPage = () => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(initialQuery);

  const debouncedQuery = useDebouncedValue(inputValue, 1000);
  const [isTransPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      const query = debouncedQuery.trim();
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (query) next.set("q", query);
        else next.delete("q");
        return next;
      });
    });
  }, [debouncedQuery, setSearchParams, startTransition]);

  const search = (searchParams.get("q") ?? "").trim();
  const searchBy = search ? (["username"] as string[]) : undefined;

  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUsersInfinite({
    limit: 20,
    sortBy: ["username:ASC"],
    search,
    searchBy,
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
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersect, IO_OPTIONS);
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  
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
        {(error as Error)?.message ?? "Failed to load users"}
      </Typography>
    );
  }

  const users = data?.pages.flatMap((page) => page.items) ?? [];
  const hasUsers = users.length > 0;

  const isTyping = inputValue !== debouncedQuery;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h5">Users</Typography>
        <Chip label={`${users.length} loaded`} size="small" />
        <Box sx={{ flex: 1 }} />
        <TextField
          size="small"
          placeholder="Search by username…"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          slotProps={{input: {
            startAdornment: (
              <InputAdornment position="start">
                {isTyping || isTransPending ? (
                  <CircularProgress size={16} />
                ) : (
                  <SearchIcon fontSize="small" />
                )}
              </InputAdornment>
            ),
            endAdornment: inputValue ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear"
                  size="small"
                  onClick={() => setInputValue("")}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }
            
          }}
          sx={{ minWidth: 280 }}
        />
      </Stack>

      {!hasUsers && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {search ? "No users match your query." : "No users found."}
        </Typography>
      )}

      <List disablePadding>
        {users.map((user) => (
          <ListItem key={user.id} divider disableGutters>
            <ListItemButton component={RouterLink} to={`/users/${user.id}`}>
              <ListItemText
                primary={user.username}
                secondary={`Role: ${user.role}`}
                slotProps={{ primary: { sx: { fontWeight: 600 } } }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <div ref={sentinelRef} />

      {isFetchingNextPage && (
        <Box sx={{ display: "grid", placeItems: "center", py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

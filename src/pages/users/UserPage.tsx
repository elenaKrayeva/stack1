import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Button,
} from "@mui/material";
import { useUser, useUserStatistic } from "@/features/users/queries";

export const UserPage = () => {
  const { id } = useParams<{ id: string }>();
  const userId = id ?? "";

  const { data: user, status: userStatus, error: userError } = useUser(userId);
  const {
    data: stats,
    status: statsStatus,
    error: statsError,
  } = useUserStatistic(userId);

  if (userStatus === "pending") {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (userStatus === "error") {
    return (
      <Typography color="error">
        {(userError as Error)?.message ?? "Failed to load user"}
      </Typography>
    );
  }

  return (
    <Box className="max-w-4xl mx-auto" sx={{ my: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" fontWeight={700}>
          {user?.username}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={`Role: ${user?.role || "—"}`} size="small" />
          <Button
            component={RouterLink}
            to="/users"
            variant="outlined"
            size="small"
          >
            Back to users
          </Button>
        </Stack>
      </Stack>

      <Paper className="p-4 sm:p-6">
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            User ID:
          </Typography>
          <Typography variant="body1" fontFamily="monospace">
            {user?.id}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Statistics
        </Typography>

        {statsStatus === "pending" ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : statsStatus === "error" ? (
          <Typography color="text.secondary">
            {(statsError as Error)?.message ?? "No statistics available"}
          </Typography>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
            {[
              { label: "Rating", value: stats?.rating ?? 0 },
              { label: "Snippets", value: stats?.snippetsCount ?? 0 },
              { label: "Questions", value: stats?.questionsCount ?? 0 },
              { label: "Answers", value: stats?.answersCount ?? 0 },
              { label: "Likes", value: stats?.likesCount ?? 0 },
              { label: "Dislikes", value: stats?.dislikesCount ?? 0 },
              { label: "Comments", value: stats?.commentsCount ?? 0 },
            ].map((it) => (
              <div key={it.label}>
                <Paper className="p-3 text-center">
                  <Typography variant="h5" fontWeight={700}>
                    {it.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {it.label}
                  </Typography>
                </Paper>
              </div>
            ))}
          </div>
        )}
      </Paper>
    </Box>
  );
};

import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  Alert,
} from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

import { useAuthStore } from "@/features/auth/model/store";
import { useMeQuery, useUserStatisticQuery } from "@/features/account/queries";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logoutApi } from "@/features/auth/api";
import { deleteMyAccount } from "@/features/account/api";
import { EditProfileSection } from "./EditProfileSection";

type StatsView = {
  rating: number;
  snippets: number;
  comments: number;
  likes: number;
  dislikes: number;
  questions: number;
  correctAnswers: number;
  regularAnswers: number;
};

export const AccountPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logoutFromStore = useAuthStore((state) => state.logout);

  const authUser = useAuthStore((state) => state.user) as {
    id?: string | number;
    username?: string;
    role?: string;
    avatarUrl?: string | null;
  } | null;

  const shouldFetchMe = !authUser?.id;
  const {
    data: me,
    isLoading: meLoading,
    isError: meError,
    error: meErr,
  } = useMeQuery(shouldFetchMe);

  const id = (authUser?.id ?? me?.id) as string | number | undefined;
  const username = authUser?.username ?? me?.username ?? "—";
  const role = (authUser?.role ?? me?.role ?? "—") as string;
  const avatarUrl = authUser?.avatarUrl ?? null;

  const {
    data: statPayload,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErr,
    refetch: refetchStats,
  } = useUserStatisticQuery(id);

  const stats: StatsView | null = statPayload
    ? {
        rating: statPayload.statistic.rating,
        snippets: statPayload.statistic.snippetsCount,
        comments: statPayload.statistic.commentsCount,
        likes: statPayload.statistic.likesCount,
        dislikes: statPayload.statistic.dislikesCount,
        questions: statPayload.statistic.questionsCount,
        correctAnswers: statPayload.statistic.correctAnswersCount,
        regularAnswers: statPayload.statistic.regularAnswersCount,
      }
    : null;

  const { mutate: runLogout, isPending: isLogoutPending } = useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      await queryClient.clear();
      logoutFromStore();
      navigate("/login");
    },
  });

  const { mutate: runDeleteMyAccount, isPending: isDeletePending } =
    useMutation({
      mutationFn: () => deleteMyAccount(),
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        await queryClient.clear();
        logoutFromStore();
        navigate("/register");
      },
    });

  const handleLogout = () => {
    if (isDeletePending) return;
    runLogout();
    localStorage.removeItem("auth");
  };

  const handleDeleteAccount = () => {
    if (isLogoutPending) return;
    const confirmed = window.confirm(
      "Delete account? This action is irreversible."
    );
    if (!confirmed) return;
    runDeleteMyAccount();
  };

  return (
    <Box className="w-full px-4 py-6">
      <Typography variant="h4" className="font-semibold mb-6">
        Welcome,{" "}
        {meLoading && !authUser?.username ? (
          <Skeleton width={160} />
        ) : (
          username
        )}
      </Typography>

      {meError && (
        <Alert severity="error" className="mb-4">
          Failed to load profile: {(meErr as Error)?.message ?? "unknown"}
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Card className="shadow-md rounded-2xl h-full">
            <CardHeader
              title={
                <Typography variant="h6" className="font-semibold">
                  Overview
                </Typography>
              }
              sx={{ pb: 0 }}
              action={
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Refresh">
                    <IconButton
                      onClick={() => refetchStats()}
                      aria-label="refresh-stats"
                    >
                      ⟳
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />
            <CardContent>
              {statsError && (
                <Alert severity="error" className="mb-3">
                  Failed to load statistics:{" "}
                  {(statsErr as Error)?.message ?? "unknown"}
                </Alert>
              )}
              <StatsGrid
                loading={statsLoading || (shouldFetchMe && meLoading)}
                stats={stats}
              />
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-1/3">
          <Card className="shadow-md rounded-2xl h-full">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <Avatar
                      src={avatarUrl}
                      alt={username}
                      sx={{ width: 72, height: 72 }}
                    />
                  ) : (
                    <Avatar sx={{ width: 72, height: 72 }}>
                      <PersonRoundedIcon />
                    </Avatar>
                  )}
                  <div>
                    <Typography variant="h6" className="font-semibold">
                      {meLoading && !authUser?.username ? (
                        <Skeleton width={140} />
                      ) : (
                        username
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {id ?? <Skeleton width={60} />}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Role:{" "}
                      {meLoading && !authUser?.role ? (
                        <Skeleton width={80} />
                      ) : (
                        role
                      )}
                    </Typography>
                  </div>
                </div>

                <Stack direction="row" spacing={1}>
                  <Tooltip title="Logout">
                    <span>
                      <IconButton
                        color="primary"
                        onClick={handleLogout}
                        aria-label="logout"
                        disabled={isLogoutPending || isDeletePending}
                      >
                        <LogoutRoundedIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Delete account">
                    <span>
                      <IconButton
                        color="error"
                        onClick={handleDeleteAccount}
                        aria-label="delete account"
                        disabled={isDeletePending || isLogoutPending}
                      >
                        <DeleteForeverRoundedIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-sm rounded-2xl border border-dashed border-slate-300">
        <CardContent>
          <EditProfileSection initialUsername={username} />
        </CardContent>
      </Card>
    </Box>
  );
};

const StatsGrid = ({
  loading,
  stats,
}: {
  loading: boolean;
  stats: StatsView | null;
}) => {
  const items: Array<{ key: keyof StatsView; label: string }> = [
    { key: "rating", label: "Rating" },
    { key: "snippets", label: "Snippets" },
    { key: "comments", label: "Comments" },
    { key: "likes", label: "Likes" },
    { key: "dislikes", label: "Dislikes" },
    { key: "questions", label: "Questions" },
    { key: "correctAnswers", label: "Correct Answers" },
    { key: "regularAnswers", label: "Regular Answers" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map(({ key, label }) => (
        <div
          key={label}
          className="rounded-xl border border-slate-200 p-3 hover:shadow-sm transition"
        >
          <Typography variant="body2" color="text.secondary" className="mb-1">
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={60} />
          ) : (
            <Typography variant="h6" className="font-semibold">
              {stats ? (stats[key] as number) : "—"}
            </Typography>
          )}
        </div>
      ))}
    </div>
  );
};

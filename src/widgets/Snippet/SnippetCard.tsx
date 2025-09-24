import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Button,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { Snippet } from "@/features/snippets/types";
import { useNavigate } from "react-router-dom";
import { useMarkSnippet, useDeleteSnippet } from "@/features/snippets/queries";
import { useAuthStore } from "@/features/auth/model/store";
import { useState } from "react";

const getCodePreview = (code: string, maxLines: number = 12): string => {
  const lines = code.split("\n");
  const preview = lines.slice(0, maxLines).join("\n");
  return preview + (lines.length > maxLines ? "\n..." : "");
};

export const SnippetCard = ({ snippet }: { snippet: Snippet }) => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const canInteract = Boolean(user);
  const { mutate: markSnippet, isPending } = useMarkSnippet();
  const { mutate: deleteSnippetMut, isPending: isDeleting } =
    useDeleteSnippet();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNavigateToPost = (): void => {
    navigate(`/snippets/${snippet.id}`);
  };

  const handleCopyCode = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(snippet.code);
    } catch (error) {
      console.error("Failed to copy code to clipboard:", error);
    }
  };

  const handleCommentsKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ): void => {
    if (event.key === "Enter" || event.key === " ") {
      handleNavigateToPost();
    }
  };

  const handleMark = (kind: "like" | "dislike") => {
    if (!canInteract || isPending) return;
    setErrorMsg(null);
    markSnippet(
      { id: snippet.id, mark: kind, authorId: snippet.author.id },
      {
        onError: (event: any) => {
          setErrorMsg(event?.response?.data?.message ?? event?.message ?? "Failed");
        },
      }
    );
  };

  const likesCount = snippet.likes ?? 0;
  const dislikesCount = snippet.dislikes ?? 0;
  const commentsCount = snippet.commentsCount ?? 0;

  return (
    <Card sx={{ mb: 2, overflow: "hidden" }}>
      <CardHeader
        title={`#${snippet.id} • ${snippet.language}`}
        subheader={`by ${snippet.author.username}`}
      />
      <CardContent>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 1.5,
            bgcolor: "grey.100",
            borderRadius: 1,
            overflowX: "auto",
          }}
        >
          <code>{getCodePreview(snippet.code)}</code>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Tooltip title={canInteract ? "Like" : "Login to like"}>
              <span>
                <IconButton
                  aria-label="like"
                  size="small"
                  onClick={() => handleMark("like")}
                  disabled={!canInteract || isPending}
                >
                  <ThumbUpAltOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Typography variant="body2">{likesCount}</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Tooltip title={canInteract ? "Dislike" : "Login to dislike"}>
              <span>
                <IconButton
                  aria-label="dislike"
                  size="small"
                  onClick={() => handleMark("dislike")}
                  disabled={!canInteract || isPending}
                >
                  <ThumbDownAltOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Typography variant="body2">{dislikesCount}</Typography>
          </Box>

          <Box
            role="button"
            tabIndex={0}
            onClick={handleNavigateToPost}
            onKeyDown={handleCommentsKeyDown}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              cursor: "pointer",
            }}
            aria-label="open comments"
          >
            <ChatBubbleOutlineIcon fontSize="small" />
            <Typography variant="body2">{commentsCount} comments</Typography>
          </Box>
          {user?.id === snippet.author.id && (
            <>
              <Tooltip title="Edit snippet">
                <IconButton
                  size="small"
                  aria-label="edit snippet"
                  onClick={() => navigate(`/snippets/${snippet.id}/edit`)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete snippet">
                <span>
                  <IconButton
                    size="small"
                    aria-label="delete snippet"
                    onClick={() => setConfirmOpen(true)}
                    disabled={isDeleting}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Copy code">
            <IconButton
              onClick={handleCopyCode}
              size="small"
              aria-label="copy code"
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {errorMsg && (
          <Typography
            variant="caption"
            color="error"
            sx={{ mt: 1, display: "block" }}
          >
            {errorMsg}
          </Typography>
        )}
        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          aria-labelledby="confirm-delete-title"
        >
          <DialogTitle id="confirm-delete-title">Delete snippet?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This action cannot be undone. Are you sure you want to delete
              snippet #{snippet.id}?
            </DialogContentText>
            {deleteError && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 1, display: "block" }}
              >
                {deleteError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => {
                setDeleteError(null);
                deleteSnippetMut(
                  { id: snippet.id },
                  {
                    onSuccess: () => {
                      setConfirmOpen(false);
                    },
                    onError: (event: any) => {
                      setDeleteError(
                        event?.response?.data?.message ??
                          event?.message ??
                          "Failed to delete"
                      );
                    },
                  }
                );
              }}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

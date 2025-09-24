import type { Question } from "../types";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
} from "@mui/material";
import { useAuthStore } from "@/features/auth/model/store";
import { useDeleteQuestion } from "@/features/questions/queries";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type React from "react";

type Props = {
  question: Question;
  onClick?: (id: number) => void;
  onDeleted?: () => void;
};

export const QuestionCard = ({ question, onClick, onDeleted }: Props) => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate: deleteQuestionMut, isPending: isDeleting } =
    useDeleteQuestion();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const stop: React.MouseEventHandler = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const handleCardClick = () => {
    if (confirmOpen || isDeleting) return;
    onClick?.(question.id);
  };

  return (
    <Card
      variant="outlined"
      sx={{ cursor: onClick ? "pointer" : "default" }}
      onClick={handleCardClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="h6">{question.title}</Typography>
          {question.resolved && (
            <Chip label="Resolved" size="small" color="success" />
          )}

          {user?.id === question.author.id && (
            <Box ml="auto" display="flex" alignItems="center" gap={0.5}>
              <Tooltip title="Edit question">
                <IconButton
                  size="small"
                  onClick={(event) => {
                    stop(event);
                    navigate(`/questions/${question.id}/edit`);
                  }}
                  aria-label="edit question"
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete question">
                <span>
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      stop(event);
                      setConfirmOpen(true);
                    }}
                    disabled={isDeleting}
                    aria-label="delete question"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}
        </Box>

        {question.body && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 1,
            }}
          >
            {question.body}
          </Typography>
        )}

        {question.code && (
          <Box
            component="pre"
            sx={{
              bgcolor: "grey.100",
              p: 1,
              borderRadius: 1,
              fontSize: "0.875rem",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              mb: 1,
            }}
          >
            <code>{question.code}</code>
          </Box>
        )}

        <Box display="flex" gap={2} flexWrap="wrap">
          <Typography variant="caption" color="text.secondary">
            Answers: {question.answersCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Author: {question.author.username}
          </Typography>
          {question.createdAt && (
            <Typography variant="caption" color="text.secondary">
              {new Date(question.createdAt).toLocaleString()}
            </Typography>
          )}
        </Box>
      </CardContent>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="confirm-delete-title"
      >
        <DialogTitle id="confirm-delete-title">Delete question?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. Are you sure you want to delete “
            {question.title}”?
          </DialogContentText>
          {deleteError && (
            <p className="text-red-600 text-sm mt-2">{deleteError}</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() =>
              deleteQuestionMut(
                { id: question.id },
                {
                  onSuccess: () => {
                    setConfirmOpen(false);
                    onDeleted?.();
                  },
                  onError: (event: any) =>
                    setDeleteError(
                      event?.response?.data?.message ??
                        event?.message ??
                        "Failed to delete"
                    ),
                }
              )
            }
            disabled={isDeleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

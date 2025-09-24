import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCommentsRoom, type WebSocketComment } from "./useCommentsRoom";
import { useAuthStore } from "@/features/auth/model/store";

type ApiComment = {
  id: number;
  content: string;
  user: { id: number; username: string; role?: string };
  createdAt?: string;
};

type CommentsSectionProps = {
  snippetId: number;
  initialComments?: ApiComment[];
};

export const CommentsSection = ({
  snippetId,
  initialComments = [],
}: CommentsSectionProps) => {
  const currentUser = useAuthStore((store) => store.user);
  const roomIdentifier = useMemo(() => `snippet:${snippetId}`, [snippetId]);
  const [commentsList, setCommentsList] = useState<WebSocketComment[]>([]);
  const inputElementReference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCommentsList(
      (initialComments ?? []).map((apiComment) => ({
        id: Number(apiComment.id),
        roomId: roomIdentifier,
        body: apiComment.content,
        author: {
          id: Number(apiComment.user?.id ?? 0),
          username: apiComment.user?.username ?? "user",
          role: apiComment.user?.role,
        },
        createdAt: apiComment.createdAt ?? new Date().toISOString(),
      }))
    );
  }, [roomIdentifier, initialComments]);

  const { emitCreateComment } = useCommentsRoom({
    roomId: roomIdentifier,
    getToken: () => localStorage.getItem("access_token") ?? undefined,
    onCreated: (createdComment) => {
      setCommentsList((previousComments) => {
        if (createdComment.tempId) {
          const existingIndex = previousComments.findIndex(
            (existingComment) =>
              (existingComment as any).tempId === createdComment.tempId
          );
          if (existingIndex >= 0) {
            const updatedComments = [...previousComments];
            updatedComments[existingIndex] = {
              ...updatedComments[existingIndex],
              ...createdComment,
            };
            return updatedComments;
          }
        }
        return [...previousComments, createdComment];
      });
    },
    onUpdated: (updatedComment) =>
      setCommentsList((previousComments) =>
        previousComments.map((existingComment) =>
          existingComment.id === updatedComment.id
            ? updatedComment
            : existingComment
        )
      ),
    onDeleted: ({ id }) =>
      setCommentsList((previousComments) =>
        previousComments.filter(
          (existingComment) => existingComment.id !== id
        )
      ),
  });

  const handleSubmitForm = (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    const inputValue = inputElementReference.current?.value?.trim();
    if (!inputValue) return;

    const temporaryIdentifier = crypto.randomUUID();

    setCommentsList((previousComments) => [
      ...previousComments,
      {
        id: -1,
        tempId: temporaryIdentifier,
        roomId: roomIdentifier,
        body: inputValue,
        author: {
          id: Number(currentUser?.id ?? 0),
          username: currentUser?.username ?? "me",
        },
        createdAt: new Date().toISOString(),
      },
    ]);

    emitCreateComment(inputValue, temporaryIdentifier);

    if (inputElementReference.current) {
      inputElementReference.current.value = "";
    }
  };

  return (
    <Box>
      <Typography variant="h6" className="mb-1">
        Comments
      </Typography>
      <Divider className="mb-2" />

      {commentsList.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No comments yet.
        </Typography>
      ) : (
        <List dense>
          {commentsList.map((commentItem) => (
            <ListItem
              key={commentItem.tempId ?? commentItem.id}
              alignItems="flex-start"
            >
              <ListItemAvatar>
                <Avatar>
                  {commentItem.author.username?.[0]?.toUpperCase?.() || "U"}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2">
                      {commentItem.author.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(commentItem.createdAt).toLocaleString()}
                    </Typography>
                    {commentItem.id === -1 && (
                      <Typography variant="caption" color="text.secondary">
                        sending…
                      </Typography>
                    )}
                  </Stack>
                }
                secondary={
                  <Typography variant="body2">{commentItem.body}</Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <Box component="form" onSubmit={handleSubmitForm} className="mt-2">
        <Stack direction="row" spacing={1}>
          <TextField
            inputRef={inputElementReference}
            name="body"
            size="small"
            fullWidth
            placeholder={
              currentUser
                ? "Add a comment…"
                : "Log in to write a comment"
            }
            disabled={!currentUser}
          />
          <Button type="submit" variant="contained" disabled={!currentUser}>
            Send
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

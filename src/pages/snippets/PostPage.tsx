import { useParams, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useSnippet, useMarkSnippet } from "@/features/snippets/queries";
import type { Snippet } from "@/features/snippets/types";
import { useAuthStore } from "@/features/auth/model/store";
import { useCallback, useState } from "react";
import { CommentsSection } from "@/features/comments/CommentsSection";

type RouteLocationState = { snippet?: Snippet };

const getCodePreview = (code: string): string => code;

export const PostPage = () => {
  const { id } = useParams();
  const numericIdentifier = Number(id);
  const routeLocation = useLocation();
  const routeLocationState = routeLocation.state as RouteLocationState | undefined;

  const { data: fetchedSnippet, status: fetchStatus, error: fetchError } = useSnippet(numericIdentifier);

  const currentUser = useAuthStore((store) => store.user);
  const canInteractWithActions = Boolean(currentUser);

  const { mutate: markSnippetMutation, isPending: isMarkMutationPending } = useMarkSnippet();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCopyCodeToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText((fetchedSnippet ?? routeLocationState?.snippet)?.code ?? "");
    } catch (clipboardError) {
      console.error("Failed to copy code to clipboard:", clipboardError);
      alert("Failed to copy code");
    }
  }, [fetchedSnippet, routeLocationState?.snippet]);

  const handleMarkAction =
    (markKind: "like" | "dislike") =>
    (mouseEvent: React.MouseEvent<HTMLButtonElement>) => {
      mouseEvent.stopPropagation();
      if (!canInteractWithActions || isMarkMutationPending) return;

      const effectiveSnippet = (fetchedSnippet ?? routeLocationState?.snippet) as Snippet | undefined;
      if (!effectiveSnippet) return;

      setErrorMessage(null);

      markSnippetMutation(
        { id: effectiveSnippet.id, mark: markKind, authorId: effectiveSnippet.author.id },
        {
          onError: (mutationError: any) => {
            setErrorMessage(
              mutationError?.response?.data?.message ??
                mutationError?.message ??
                "Failed to apply mark"
            );
          },
        }
      );
    };

  if (!Number.isFinite(numericIdentifier)) {
    return <Typography color="error">Invalid post id.</Typography>;
  }

  if (fetchStatus === "pending" && !routeLocationState?.snippet) {
    return (
      <div className="grid place-items-center py-6">
        <CircularProgress />
      </div>
    );
  }

  const effectiveSnippet = (fetchedSnippet ?? routeLocationState?.snippet) as Snippet | undefined;
  if (!effectiveSnippet) {
    return (
      <Typography color="error">
        {(fetchError as Error)?.message ?? "Post not found"}
      </Typography>
    );
  }

  const domainComments = effectiveSnippet.comments ?? [];
  const initialCommentsForSection = domainComments.map((domainComment) => ({
    id: domainComment.id,
    content: domainComment.content,
    user: {
      id: domainComment.author.id,
      username: domainComment.author.username,
      role: domainComment.author.role,
    },
    createdAt: (domainComment as any).createdAt,
  }));

  const likesCount = effectiveSnippet.likes ?? 0;
  const dislikesCount = effectiveSnippet.dislikes ?? 0;
  const commentsCount = effectiveSnippet.comments?.length ?? effectiveSnippet.commentsCount ?? 0;

  return (
    <div>
      <Card className="mb-2 overflow-hidden">
        <CardHeader
          title={`#${effectiveSnippet.id} • ${effectiveSnippet.language}`}
          subheader={`by ${effectiveSnippet.author.username}`}
          action={
            <Tooltip title="Copy code">
              <IconButton aria-label="copy code" onClick={handleCopyCodeToClipboard}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <CardContent>
          <pre className="m-0 p-3 bg-gray-100 rounded overflow-x-auto">
            <code>{getCodePreview(effectiveSnippet.code)}</code>
          </pre>

          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Tooltip title={canInteractWithActions ? "Like" : "Login to like"}>
                <span>
                  <IconButton
                    aria-label="like"
                    size="small"
                    onClick={handleMarkAction("like")}
                    disabled={!canInteractWithActions || isMarkMutationPending}
                  >
                    <ThumbUpAltOutlinedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Typography variant="body2">{likesCount}</Typography>
            </div>

            <div className="flex items-center gap-1">
              <Tooltip title={canInteractWithActions ? "Dislike" : "Login to dislike"}>
                <span>
                  <IconButton
                    aria-label="dislike"
                    size="small"
                    onClick={handleMarkAction("dislike")}
                    disabled={!canInteractWithActions || isMarkMutationPending}
                  >
                    <ThumbDownAltOutlinedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Typography variant="body2">{dislikesCount}</Typography>
            </div>

            <div className="flex items-center gap-1">
              <ChatBubbleOutlineIcon fontSize="small" aria-label="comments" />
              <Typography variant="body2">{commentsCount}</Typography>
            </div>
          </div>

          {errorMessage && (
            <Typography variant="caption" color="error" className="mt-1 block">
              {errorMessage}
            </Typography>
          )}
        </CardContent>
      </Card>

      <CommentsSection
        snippetId={effectiveSnippet.id}
        initialComments={initialCommentsForSection}
      />
    </div>
  );
};

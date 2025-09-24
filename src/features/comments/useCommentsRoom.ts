import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "@/shared/ws/socket";

export type WebSocketComment = {
  id: number;
  roomId: string;
  body: string;
  author: { id: number; username: string; role?: string };
  createdAt: string;
  updatedAt?: string;
  tempId?: string;
};

type UseCommentsRoomOptions = {
  roomId: string;
  getToken?: () => string | undefined;
  onCreated?: (comment: WebSocketComment) => void;
  onUpdated?: (comment: WebSocketComment) => void;
  onDeleted?: (payload: { id: number }) => void;
};

export const useCommentsRoom = ({
  roomId: roomIdentifier,
  getToken: getAccessToken,
  onCreated: onCommentCreated,
  onUpdated: onCommentUpdated,
  onDeleted: onCommentDeleted,
}: UseCommentsRoomOptions) => {
  const socketReference = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = createSocket(getAccessToken) as Socket;
    socketReference.current = socket;

    const joinRoom = () =>
      socket.emit("room:join", { roomId: roomIdentifier }, () => {});

    socket.connect();
    socket.on("connect", joinRoom);
    socket.on("reconnect", joinRoom);

    if (onCommentCreated) socket.on("comment:created", onCommentCreated);
    if (onCommentUpdated) socket.on("comment:updated", onCommentUpdated);
    if (onCommentDeleted) socket.on("comment:deleted", onCommentDeleted);

    return () => {
      if (onCommentCreated) socket.off("comment:created", onCommentCreated);
      if (onCommentUpdated) socket.off("comment:updated", onCommentUpdated);
      if (onCommentDeleted) socket.off("comment:deleted", onCommentDeleted);
      socket.emit("room:leave", { roomId: roomIdentifier }, () => {});
      socket.disconnect();
    };
  }, [roomIdentifier, getAccessToken, onCommentCreated, onCommentUpdated, onCommentDeleted]);

  return {
    emitCreateComment: (commentBody: string, temporaryIdentifier?: string) =>
      socketReference.current?.emit(
        "comment:create",
        { roomId: roomIdentifier, body: commentBody, tempId: temporaryIdentifier },
        () => {}
      ),

    emitUpdateComment: (identifier: number, commentBody: string) =>
      socketReference.current?.emit(
        "comment:update",
        { id: identifier, body: commentBody },
        () => {}
      ),

    emitDeleteComment: (identifier: number) =>
      socketReference.current?.emit("comment:delete", { id: identifier }, () => {}),
  };
}

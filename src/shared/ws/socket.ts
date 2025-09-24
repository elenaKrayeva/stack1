import {
  io,
  type Socket,
  type ManagerOptions,
  type SocketOptions,
} from "socket.io-client";

const WEB_SOCKET_ENABLED =
  (import.meta.env.VITE_WS_ENABLED ?? "true") === "true";
const WEB_SOCKET_NAMESPACE = import.meta.env.VITE_WS_NAMESPACE ?? "/ws";
const WEB_SOCKET_PATH = import.meta.env.VITE_WS_PATH;
const WEB_SOCKET_DEBUG = (import.meta.env.VITE_WS_DEBUG ?? "false") === "true";

const logWebSocketDebug = (...argumentsList: any[]) => {
  if (WEB_SOCKET_DEBUG) {
    console.log("[ws]", ...argumentsList);
  }
}

type AcknowledgementCallback = (value?: any) => void;

type MockSocket = {
  id: string;
  on: (...argumentsList: any[]) => void;
  off: (...argumentsList: any[]) => void;
  emit: (
    eventName: string,
    payload?: any,
    acknowledgementCallback?: AcknowledgementCallback
  ) => void;
  connect: () => void;
  disconnect: () => void;
};

const createMockSocket = (): MockSocket => {
  return {
    id: "ws-mock",
    on: () => {},
    off: () => {},
    emit: (_eventName, _payload, acknowledgementCallback) =>
      acknowledgementCallback?.({ ok: false, mock: true }),
    connect: () => logWebSocketDebug("mock connect()"),
    disconnect: () => logWebSocketDebug("mock disconnect()"),
  };
}

export const createSocket = (
  getAccessToken?: () => string | undefined
): Socket | MockSocket => {
  if (!WEB_SOCKET_ENABLED) return createMockSocket();

  const connectionOptions: Partial<ManagerOptions & SocketOptions> = {
    path: WEB_SOCKET_PATH,
    transports: ["websocket"],
    withCredentials: true,
    auth: () => ({ token: getAccessToken?.() }),
    autoConnect: false,
    timeout: 5000,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 4000,
    randomizationFactor: 0.5,
  };

  const socket = io(WEB_SOCKET_NAMESPACE, connectionOptions);

  socket.on("connect", () =>
    logWebSocketDebug("connected", (socket as any).id)
  );
  socket.on("disconnect", (reason) =>
    logWebSocketDebug("disconnected", reason)
  );
  socket.on("connect_error", (error) =>
    logWebSocketDebug("connect_error", (error as any)?.message)
  );
  socket.on("reconnect", (attemptNumber) =>
    logWebSocketDebug("reconnected", attemptNumber)
  );

  return socket;
}

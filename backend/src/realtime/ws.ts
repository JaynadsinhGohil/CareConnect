import jwt from 'jsonwebtoken';
import { IncomingMessage } from 'http';
import { WebSocket, WebSocketServer } from 'ws';

type RealtimeEventType =
  | 'connection-ready'
  | 'appointment-created'
  | 'appointment-updated';

interface RealtimeEvent {
  type: RealtimeEventType;
  payload: Record<string, unknown>;
  timestamp: string;
}

const clients = new Set<WebSocket>();

const parseTokenFromRequest = (request: IncomingMessage): string | null => {
  const host = request.headers.host;
  const url = request.url;

  if (!host || !url) {
    return null;
  }

  try {
    const parsed = new URL(url, `http://${host}`);
    return parsed.searchParams.get('token');
  } catch {
    return null;
  }
};

const isAuthorizedDashboardClient = (request: IncomingMessage): boolean => {
  const token = parseTokenFromRequest(request);

  if (!token) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    return ['admin', 'receptionist'].includes(decoded?.role);
  } catch {
    return false;
  }
};

export const initializeRealtimeServer = (wss: WebSocketServer) => {
  wss.on('connection', (socket, request) => {
    if (!isAuthorizedDashboardClient(request)) {
      socket.close(1008, 'Unauthorized');
      return;
    }

    clients.add(socket);

    const readyEvent: RealtimeEvent = {
      type: 'connection-ready',
      payload: { message: 'Realtime channel connected' },
      timestamp: new Date().toISOString(),
    };

    socket.send(JSON.stringify(readyEvent));

    socket.on('close', () => {
      clients.delete(socket);
    });

    socket.on('error', () => {
      clients.delete(socket);
    });
  });
};

export const broadcastRealtimeEvent = (
  type: RealtimeEventType,
  payload: Record<string, unknown>
) => {
  const event: RealtimeEvent = {
    type,
    payload,
    timestamp: new Date().toISOString(),
  };

  const serialized = JSON.stringify(event);

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(serialized);
    }
  }
};

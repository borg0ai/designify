/**
 * 单屏 HTTP + WebSocket server。
 * startServer 返回端口、choice 承诺，以及 close。
 * choice 在第一条带非空 choice 字段的文本帧上兑现，且只兑现一次。
 */
import http from "node:http";
import type { Duplex } from "node:stream";
import { hasMatchingKey } from "./authorize.ts";
import {
  CHOICE_FIELD,
  CONTENT_TYPE_HTML,
  DEFAULT_HOST,
  HEADER_CONTENT_TYPE,
  HEADER_UPGRADE,
  HEADER_WS_KEY,
  HTTP_FORBIDDEN,
  HTTP_NOT_FOUND,
  HTTP_OK,
  METHOD_GET,
  OPCODE_CLOSE,
  OPCODE_PING,
  OPCODE_PONG,
  OPCODE_TEXT,
  PATH_ROOT,
  UPGRADE_WEBSOCKET,
} from "./constants.ts";
import { acceptKey, decodeClientFrame, encodeServerFrame } from "./frames.ts";

const SWITCHING_PROTOCOLS = "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n";

export type ChoiceEvent = {
  choice: string;
  [key: string]: unknown;
};

export type ServerSession = {
  port: number;
  choice: Promise<ChoiceEvent>;
  close: () => Promise<void>;
};

export type StartServerOptions = {
  html: string;
  token: string;
  host?: string;
  onChoice?: (event: ChoiceEvent) => void;
};

function requestUrl(rawUrl: string | undefined): URL {
  return new URL(rawUrl ?? PATH_ROOT, `http://${DEFAULT_HOST}`);
}

function isChoiceEvent(value: unknown): value is ChoiceEvent {
  if (!value || typeof value !== "object") {
    return false;
  }
  const choice = (value as { choice?: unknown }).choice;
  return typeof choice === "string" && choice.length > 0;
}

function writeHttp(response: http.ServerResponse, status: number, body: string, contentType?: string): void {
  const headers = contentType ? { [HEADER_CONTENT_TYPE]: contentType } : undefined;
  response.writeHead(status, headers);
  response.end(body);
}

function handshake(socket: Duplex, clientKey: string): void {
  socket.write(`${SWITCHING_PROTOCOLS}Sec-WebSocket-Accept: ${acceptKey(clientKey)}\r\n\r\n`);
}

export function startServer({ html, token, host = DEFAULT_HOST, onChoice }: StartServerOptions): Promise<ServerSession> {
  if (typeof html !== "string") {
    return Promise.reject(new TypeError("html must be a string"));
  }
  if (typeof token !== "string" || token.length === 0) {
    return Promise.reject(new TypeError("token must be a non-empty string"));
  }

  let resolveChoice: (event: ChoiceEvent) => void = () => {};
  let settled = false;
  const choice = new Promise<ChoiceEvent>((resolve) => {
    resolveChoice = resolve;
  });
  const sockets = new Set<Duplex>();

  function settle(event: ChoiceEvent): void {
    if (typeof onChoice === "function") {
      onChoice(event);
    }
    if (settled) {
      return;
    }
    settled = true;
    resolveChoice(event);
  }

  const server = http.createServer((request, response) => {
    const url = requestUrl(request.url);
    if (!hasMatchingKey(url.searchParams, token)) {
      writeHttp(response, HTTP_FORBIDDEN, "forbidden");
      return;
    }
    if (request.method === METHOD_GET && url.pathname === PATH_ROOT) {
      writeHttp(response, HTTP_OK, html, CONTENT_TYPE_HTML);
      return;
    }
    writeHttp(response, HTTP_NOT_FOUND, "not found");
  });

  server.on("upgrade", (request, socket) => {
    const url = requestUrl(request.url);
    const clientKey = request.headers[HEADER_WS_KEY];
    const upgrade = request.headers[HEADER_UPGRADE];
    const allowed = hasMatchingKey(url.searchParams, token)
      && typeof clientKey === "string"
      && typeof upgrade === "string"
      && upgrade.toLowerCase() === UPGRADE_WEBSOCKET;
    if (!allowed || typeof clientKey !== "string") {
      socket.destroy();
      return;
    }
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.on("error", () => sockets.delete(socket));
    handshake(socket, clientKey);

    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk]);
      while (buffer.length > 0) {
        let frame;
        try {
          frame = decodeClientFrame(buffer);
        } catch {
          socket.destroy();
          return;
        }
        if (!frame) {
          return;
        }
        buffer = buffer.subarray(frame.bytesConsumed);
        if (frame.opcode === OPCODE_PING) {
          socket.write(encodeServerFrame(OPCODE_PONG, frame.payload));
          continue;
        }
        if (frame.opcode === OPCODE_CLOSE) {
          socket.end(encodeServerFrame(OPCODE_CLOSE, Buffer.alloc(0)));
          return;
        }
        if (frame.opcode !== OPCODE_TEXT) {
          continue;
        }
        let event: unknown;
        try {
          event = JSON.parse(frame.payload.toString("utf8")) as unknown;
        } catch {
          continue;
        }
        if (isChoiceEvent(event)) {
          settle(event);
        }
      }
    });
  });

  function close(): Promise<void> {
    for (const socket of sockets) {
      socket.destroy();
    }
    return new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, host, () => {
      const address = server.address();
      resolve({
        port: typeof address === "object" && address ? address.port : 0,
        choice,
        close,
      });
    });
  });
}

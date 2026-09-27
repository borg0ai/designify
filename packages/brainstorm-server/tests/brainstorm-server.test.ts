/**
 * 单屏 brainstorm server：带 key 才给 HTML，带非空 choice 的 WebSocket 消息才结束等待。
 */
import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";

const HOST = "127.0.0.1";
const TOKEN = "test-key-0123456789abcdef";
const HTML = "<p>screen</p>";
const CHOICE_ID = "layout-a";
const CHOICE_FIELD = "choice";
const QUERY_KEY = "key";
const SERVER_MODULE = "../src/server.ts";

function pageUrl(port: number, key?: string): URL {
  const url = new URL(`http://${HOST}:${port}/`);
  if (key !== undefined) {
    url.searchParams.set(QUERY_KEY, key);
  }
  return url;
}

function socketUrl(port: number, key?: string): URL {
  const url = new URL(`ws://${HOST}:${port}/`);
  if (key !== undefined) {
    url.searchParams.set(QUERY_KEY, key);
  }
  return url;
}

function get(url: URL): Promise<{ status: number | undefined; text: string }> {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("end", () => {
        resolve({
          status: response.statusCode,
          text: Buffer.concat(chunks).toString("utf8"),
        });
      });
    });
    request.on("error", reject);
  });
}

function openSocket(url: URL): Promise<WebSocket> {
  const socket = new WebSocket(url);
  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve(socket), { once: true });
    socket.addEventListener("error", () => reject(new Error("websocket failed")), { once: true });
  });
}

test("带匹配 key 的 GET / 返回给定 HTML", async () => {
  const { startServer } = await import(SERVER_MODULE);
  const session = await startServer({ html: HTML, token: TOKEN, host: HOST });
  try {
    const response = await get(pageUrl(session.port, TOKEN));
    assert.equal(response.status, 200);
    assert.equal(response.text, HTML);
  } finally {
    await session.close();
  }
});

test("没有 key 的 HTTP 和 WebSocket 不会结束 choice", async () => {
  const { startServer } = await import(SERVER_MODULE);
  const session = await startServer({ html: HTML, token: TOKEN, host: HOST });
  let settled = false;
  session.choice.then(() => {
    settled = true;
  });
  try {
    const response = await get(pageUrl(session.port));
    assert.equal(response.status, 403);
    await assert.rejects(openSocket(socketUrl(session.port)));
    await new Promise((resolve) => {
      setTimeout(resolve, 30);
    });
    assert.equal(settled, false);
  } finally {
    await session.close();
  }
});

test("第一条非空 choice 结束等待，空 choice 被忽略", async () => {
  const { startServer } = await import(SERVER_MODULE);
  const session = await startServer({ html: HTML, token: TOKEN, host: HOST });
  try {
    const socket = await openSocket(socketUrl(session.port, TOKEN));
    socket.send(JSON.stringify({ [CHOICE_FIELD]: "" }));
    socket.send(JSON.stringify({ [CHOICE_FIELD]: CHOICE_ID, source: "click" }));
    const event = await session.choice;
    assert.equal(event[CHOICE_FIELD], CHOICE_ID);
    assert.equal(event.source, "click");
    socket.close();
  } finally {
    await session.close();
  }
});

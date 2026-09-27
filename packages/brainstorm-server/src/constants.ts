/** 单屏 server 用到的协议常量。不读取环境变量。 */

export const DEFAULT_HOST = "127.0.0.1";
export const QUERY_KEY = "key";
export const CHOICE_FIELD = "choice";
export const PATH_ROOT = "/";
export const METHOD_GET = "GET";

export const HTTP_OK = 200;
export const HTTP_FORBIDDEN = 403;
export const HTTP_NOT_FOUND = 404;

export const HEADER_CONTENT_TYPE = "content-type";
export const HEADER_UPGRADE = "upgrade";
export const HEADER_WS_KEY = "sec-websocket-key";
export const UPGRADE_WEBSOCKET = "websocket";
export const CONTENT_TYPE_HTML = "text/html; charset=utf-8";

/** RFC 6455 握手魔术串。 */
export const WS_MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
export const OPCODE_TEXT = 0x01;
export const OPCODE_CLOSE = 0x08;
export const OPCODE_PING = 0x09;
export const OPCODE_PONG = 0x0a;
export const FIN_BIT = 0x80;
export const MASK_BIT = 0x80;
export const LENGTH_16 = 126;
export const LENGTH_64 = 127;
export const MAX_FRAME_PAYLOAD_BYTES = 1024 * 1024;

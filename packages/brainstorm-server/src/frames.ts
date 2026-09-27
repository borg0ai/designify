/**
 * WebSocket 帧的纯函数。服务端发出的帧不带 mask，客户端发来的帧必须带 mask。
 */
import { createHash } from "node:crypto";
import {
  FIN_BIT,
  LENGTH_16,
  LENGTH_64,
  MASK_BIT,
  MAX_FRAME_PAYLOAD_BYTES,
  WS_MAGIC,
} from "./constants.ts";

const MASK_LENGTH = 4;
const HEADER_MIN = 2;
const EXTENDED_16 = 2;
const EXTENDED_64 = 8;
const PAYLOAD_16_LIMIT = 65536;

export type ClientFrame = {
  opcode: number;
  payload: Buffer;
  bytesConsumed: number;
};

/** 计算 Sec-WebSocket-Accept。 */
export function acceptKey(clientKey: string): string {
  return createHash("sha1").update(`${clientKey}${WS_MAGIC}`).digest("base64");
}

/** 编码服务端帧。payload 是 Buffer。 */
export function encodeServerFrame(opcode: number, payload: Buffer): Buffer {
  const length = payload.length;
  const head = length < LENGTH_16 ? HEADER_MIN : length < PAYLOAD_16_LIMIT ? HEADER_MIN + EXTENDED_16 : HEADER_MIN + EXTENDED_64;
  const header = Buffer.alloc(head);
  header[0] = FIN_BIT | opcode;
  if (length < LENGTH_16) {
    header[1] = length;
  } else if (length < PAYLOAD_16_LIMIT) {
    header[1] = LENGTH_16;
    header.writeUInt16BE(length, HEADER_MIN);
  } else {
    header[1] = LENGTH_64;
    header.writeBigUInt64BE(BigInt(length), HEADER_MIN);
  }
  return Buffer.concat([header, payload]);
}

/**
 * 解析一个客户端帧。字节不够时返回 null。
 * 未 mask 或超过上限时抛错，调用方应断开连接。
 */
export function decodeClientFrame(buffer: Buffer): ClientFrame | null {
  if (buffer.length < HEADER_MIN) {
    return null;
  }
  const opcode = buffer[0] & 0x0f;
  const masked = (buffer[1] & MASK_BIT) !== 0;
  let length = buffer[1] & 0x7f;
  let offset = HEADER_MIN;
  if (!masked) {
    throw new Error("client frame must be masked");
  }
  if (length === LENGTH_16) {
    if (buffer.length < HEADER_MIN + EXTENDED_16) {
      return null;
    }
    length = buffer.readUInt16BE(HEADER_MIN);
    offset = HEADER_MIN + EXTENDED_16;
  } else if (length === LENGTH_64) {
    if (buffer.length < HEADER_MIN + EXTENDED_64) {
      return null;
    }
    const extended = buffer.readBigUInt64BE(HEADER_MIN);
    if (extended > BigInt(MAX_FRAME_PAYLOAD_BYTES)) {
      throw new Error("frame too large");
    }
    length = Number(extended);
    offset = HEADER_MIN + EXTENDED_64;
  }
  if (length > MAX_FRAME_PAYLOAD_BYTES) {
    throw new Error("frame too large");
  }
  const dataOffset = offset + MASK_LENGTH;
  const total = dataOffset + length;
  if (buffer.length < total) {
    return null;
  }
  const mask = buffer.subarray(offset, dataOffset);
  const payload = Buffer.alloc(length);
  for (let index = 0; index < length; index += 1) {
    payload[index] = buffer[dataOffset + index] ^ mask[index % MASK_LENGTH];
  }
  return { opcode, payload, bytesConsumed: total };
}

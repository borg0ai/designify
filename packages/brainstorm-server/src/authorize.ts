/** 比对 URL 查询参数里的 key 和本次进程的 token。长度不同直接拒绝。 */
import { timingSafeEqual } from "node:crypto";
import { QUERY_KEY } from "./constants.ts";

export function hasMatchingKey(searchParams: URLSearchParams, token: string): boolean {
  const given = searchParams.get(QUERY_KEY);
  if (given === null || given.length !== token.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(given), Buffer.from(token));
}

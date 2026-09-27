/** SessionStart 注入文本与各宿主 JSON 形状。纯函数，不读文件。 */

const SESSION_START_EVENT = "SessionStart";

const ENV_CURSOR_PLUGIN_ROOT = "CURSOR_PLUGIN_ROOT";
const ENV_CLAUDE_PLUGIN_ROOT = "CLAUDE_PLUGIN_ROOT";
const ENV_MUSE_PLUGIN_ROOT = "MUSE_PLUGIN_ROOT";
const ENV_COPILOT_CLI = "COPILOT_CLI";

const FIELD_HOOK_SPECIFIC_OUTPUT = "hookSpecificOutput";
const FIELD_HOOK_EVENT_NAME = "hookEventName";
const FIELD_ADDITIONAL_CONTEXT = "additionalContext";
const FIELD_ADDITIONAL_CONTEXT_SNAKE = "additional_context";

const SHAPE_CURSOR = "cursor";
const SHAPE_NESTED = "nested";
const SHAPE_SDK = "sdk";

const CONTEXT_INTRO =
  "Designify is loaded for this session. Follow its workflow router and read only the matching workflow reference when needed.";

/**
 * 按宿主环境变量选择输出形状。
 * Cursor 优先于 Claude，因为 Cursor 可能同时设置两者。
 */
export function selectOutputShape(env) {
  if (env[ENV_CURSOR_PLUGIN_ROOT]) {
    return SHAPE_CURSOR;
  }
  if (env[ENV_CLAUDE_PLUGIN_ROOT] && !env[ENV_COPILOT_CLI] && !env[ENV_MUSE_PLUGIN_ROOT]) {
    return SHAPE_NESTED;
  }
  if (env[ENV_MUSE_PLUGIN_ROOT]) {
    return SHAPE_NESTED;
  }
  return SHAPE_SDK;
}

/** 把 skill 正文包进会话引导。 */
export function buildSessionContext(skillText) {
  return `<EXTREMELY_IMPORTANT>\n${CONTEXT_INTRO}\n\n${skillText}\n</EXTREMELY_IMPORTANT>`;
}

/** 生成宿主要求的 hook stdout JSON 对象。 */
export function buildHookPayload(env, context) {
  const shape = selectOutputShape(env);
  if (shape === SHAPE_CURSOR) {
    return { [FIELD_ADDITIONAL_CONTEXT_SNAKE]: context };
  }
  if (shape === SHAPE_NESTED) {
    return {
      [FIELD_HOOK_SPECIFIC_OUTPUT]: {
        [FIELD_HOOK_EVENT_NAME]: SESSION_START_EVENT,
        [FIELD_ADDITIONAL_CONTEXT]: context,
      },
    };
  }
  return { [FIELD_ADDITIONAL_CONTEXT]: context };
}

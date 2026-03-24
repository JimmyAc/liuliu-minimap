const cloud = require('wx-server-sdk');
const { chatJson } = require('./ai');
const { retrieveContext, buildFallbackTheme, buildPrompt } = require('./rag');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const includeDebugContext = process.env.DEBUG_RAG_CONTEXT === 'true';

exports.main = async (event) => {
  const ragContext = retrieveContext(event);
  const fallbackTheme = buildFallbackTheme(event, ragContext);
  const prompt = buildPrompt(event, ragContext);

  try {
    const theme = await chatJson(
      '你是遛遛小程序的城市漫步策划助手。只返回合法 JSON，不要输出额外解释。',
      prompt
    );
    return {
      theme: { ...fallbackTheme, ...theme },
      source: 'rag+ai',
      ragContext: includeDebugContext ? ragContext : undefined,
    };
  } catch (error) {
    return {
      theme: fallbackTheme,
      source: 'rag-fallback',
      ragContext: includeDebugContext ? ragContext : undefined,
      reason: error.message || 'generate_failed',
    };
  }
};

const cloud = require('wx-server-sdk');
const { chatJson } = require('./ai');
const { retrieveContext, buildFallbackTheme, buildPrompt } = require('./rag');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const includeDebugContext = process.env.DEBUG_RAG_CONTEXT === 'true';

function normalizeMissionText(mission) {
  if (typeof mission === 'string') {
    const trimmed = mission.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return normalizeMissionText(JSON.parse(trimmed));
      } catch (error) {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (mission && typeof mission === 'object') {
    if (typeof mission.name === 'string' && typeof mission.description === 'string') {
      return `${mission.name}：${mission.description}`;
    }
    return mission.text || mission.title || mission.label || mission.mission || mission.name || JSON.stringify(mission);
  }
  return String(mission);
}

function normalizeTheme(theme, walkMode) {
  const missionCount = walkMode === 'advanced' ? 3 : 1;
  const missions = Array.isArray(theme.missions)
    ? theme.missions.map(normalizeMissionText).slice(0, missionCount)
    : [];
  return {
    ...theme,
    missions: missions.length ? missions : ['寻找一个让你驻足的细节'],
  };
}

exports.main = async (event) => {
  const ragContext = retrieveContext(event);
  const fallbackTheme = normalizeTheme(buildFallbackTheme(event, ragContext), event.walkMode);
  const prompt = buildPrompt(event, ragContext);

  try {
    const theme = normalizeTheme(await chatJson(
      '你是遛遛小程序的城市漫步策划助手。只返回合法 JSON，不要输出额外解释。',
      prompt
    ), event.walkMode);
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

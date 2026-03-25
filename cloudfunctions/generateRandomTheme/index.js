const cloud = require('wx-server-sdk');
const { chatJson } = require('./ai');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const RANDOM_CATEGORIES = ['形状漫步', '色彩漫步', '声音漫步', '纹理漫步', '市井漫步', '自然漫步'];

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
  return {
    ...theme,
    missions: (theme.missions || []).map(normalizeMissionText).slice(0, missionCount),
  };
}

exports.main = async (event) => {
  const category = event.category || RANDOM_CATEGORIES[Math.floor(Math.random() * RANDOM_CATEGORIES.length)];
  const fallbackTheme = normalizeTheme({
    title: `${category}：重新看见${event.locationName || '身边角落'}`,
    description: `围绕 ${category} 在 ${event.locationContext || '城市街道'} 中进行一次更有随机感的自由探索。`,
    category,
    missions: event.walkMode === 'advanced'
      ? ['从最不显眼的角落开始寻找一个线索', '拍下一个让你觉得今天有点不同的瞬间', '记录一个只有走近才会发现的细节']
      : ['寻找一个最能代表今天气氛的小发现'],
    vibeColor: '#6b7c59',
  }, event.walkMode);
  const prompt = `请为微信小程序“遛遛”生成一个随机 City Walk 主题。\n方向：${category}\n地点：${event.locationName || '当前位置'}\n地点语境：${event.locationContext || '城市街道'}\n模式：${event.walkMode === 'advanced' ? '进阶模式，生成3个任务' : '纯粹模式，生成1个任务'}\n要求：高度随机、明显区别于常规主题、任务有趣且可执行。返回 JSON：title, description, category, missions, vibeColor。`;

  try {
    const theme = normalizeTheme(await chatJson('你是遛遛小程序的随机主题策划助手。只返回合法 JSON。', prompt), event.walkMode);
    return { theme: { ...fallbackTheme, ...theme, category }, source: 'random+ai', randomCategory: category };
  } catch (error) {
    return { theme: fallbackTheme, source: 'random-fallback', randomCategory: category, reason: error.message || 'generate_failed' };
  }
};

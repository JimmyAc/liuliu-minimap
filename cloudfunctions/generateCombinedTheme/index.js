const cloud = require('wx-server-sdk');
const { chatJson } = require('./ai');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

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
  const categories = Array.isArray(event.categories) ? event.categories.filter(Boolean).slice(0, 3) : [];
  if (categories.length < 2) {
    return {
      theme: {
        title: '组合探索',
        description: '至少选择两个主题方向再进行组合。',
        category: '组合',
        missions: ['选择两个方向后再次生成'],
        vibeColor: '#7c6a94',
      },
      source: 'combined-fallback',
      reason: 'need_two_categories',
    };
  }

  const fallbackTheme = normalizeTheme({
    title: `${categories.join(' × ')} 组合漫步`,
    description: `把 ${categories.join('、')} 放进同一次城市观察里，寻找它们在 ${event.locationName || '这片街区'} 的交汇。`,
    category: '组合',
    missions: event.walkMode === 'advanced'
      ? ['找到一个同时呼应这两个方向的场景', '拍下一处让多个感官同时被调动的细节', '用一句话解释它们为什么会在这里相遇']
      : ['找到一个能同时让你想到这些方向的瞬间'],
    vibeColor: '#7c6a94',
  }, event.walkMode);

  const prompt = `你正在为微信小程序“遛遛”生成组合主题。\n组合方向：${categories.join('、')}\n地点：${event.locationName}\n地点语境：${event.locationContext}\n模式：${event.walkMode === 'advanced' ? '进阶模式，生成3个任务' : '纯粹模式，生成1个任务'}\n请创建一个真正融合这些方向的主题，而不是简单并列。任务要具体、宽松、具有趣味。\n返回 JSON：title, description, category, missions, vibeColor。`;

  try {
    const theme = normalizeTheme(await chatJson('你是遛遛小程序的组合主题策划助手。只返回合法 JSON。', prompt), event.walkMode);
    return { theme: { ...fallbackTheme, ...theme, category: '组合' }, source: 'combined+ai', combinedCategories: categories };
  } catch (error) {
    return { theme: fallbackTheme, source: 'combined-fallback', combinedCategories: categories, reason: error.message || 'generate_failed' };
  }
};

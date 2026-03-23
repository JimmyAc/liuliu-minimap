const { missionTemplates, preferenceBias, sceneProfiles } = require('./knowledge');

function tokenize(parts) {
  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .split(/[\s,，。；;、/|]+/)
    .filter(Boolean);
}

function scoreScene(scene, tokens, preference) {
  let score = 0;
  scene.keywords.forEach((keyword) => {
    if (tokens.some((token) => token.includes(keyword) || keyword.includes(token))) {
      score += 3;
    }
  });

  const bias = preferenceBias[preference] || [];
  if (bias.includes(scene.id)) {
    score += 2;
  }

  return score;
}

function chooseCategories(event, topScene) {
  const categories = new Set();

  if (event.preference === '自然景观') {
    categories.add('纹理');
    categories.add('声音');
  }

  if (event.preference === '人文历史') {
    categories.add('形状');
    categories.add('城市');
  }

  if (event.preference === '市井生活') {
    categories.add('色彩');
    categories.add('城市');
  }

  if (event.weather === '雨天') {
    categories.add('纹理');
    categories.add('声音');
  }

  if (event.weather === '晴朗') {
    categories.add('色彩');
    categories.add('形状');
  }

  if (event.mood === '怀旧') {
    categories.add('城市');
    categories.add('纹理');
  }

  if (topScene) {
    topScene.categories.forEach((category) => categories.add(category));
  }

  return Array.from(categories).slice(0, 3);
}

function retrieveContext(event) {
  const tokens = tokenize([
    event.locationName,
    event.locationContext,
    event.preference,
    event.weather,
    event.mood,
    event.season,
  ]);

  const rankedScenes = sceneProfiles
    .map((scene) => ({ scene, score: scoreScene(scene, tokens, event.preference) }))
    .sort((left, right) => right.score - left.score);

  const topScenes = rankedScenes.filter((item) => item.score > 0).slice(0, 2).map((item) => item.scene);
  const fallbackScenes = topScenes.length ? topScenes : [sceneProfiles[0]];
  const categories = chooseCategories(event, fallbackScenes[0]);

  const retrievedTemplates = missionTemplates
    .filter((template) => categories.includes(template.category))
    .slice(0, 4);

  const referenceMissions = retrievedTemplates.map((template) => ({
    category: template.category,
    cues: template.cues,
    samples: template.templates.slice(0, event.walkMode === 'advanced' ? 2 : 1),
  }));

  return {
    scenes: fallbackScenes.map((scene) => ({
      id: scene.id,
      labels: scene.labels,
      missionHints: scene.missionHints,
      categories: scene.categories,
    })),
    categories,
    referenceMissions,
  };
}

function buildFallbackTheme(event, ragContext) {
  const missionsNeeded = event.walkMode === 'advanced' ? 3 : 1;
  const missionPool = ragContext.referenceMissions.flatMap((item) => item.samples);
  const missions = missionPool.slice(0, missionsNeeded);
  const primaryCategory = ragContext.categories[0] || '探索';
  const sceneLabel = ragContext.scenes[0] ? ragContext.scenes[0].labels.join(' / ') : '城市街道';

  return {
    title: `${event.locationName || '城市一角'}的${primaryCategory}漫步`,
    description: `围绕 ${sceneLabel} 展开一场更贴近在地细节的城市观察。`,
    category: primaryCategory,
    missions: missions.length ? missions : ['寻找一个让你驻足的细节'],
    vibeColor: primaryCategory === '声音' ? '#52708a' : primaryCategory === '纹理' ? '#8a6a52' : '#5a5a40',
  };
}

function buildPrompt(event, ragContext) {
  const modeInstruction = event.walkMode === 'advanced'
    ? '生成 3 个具体但不过度复杂的任务。'
    : '只生成 1 个宽泛自由的任务。';

  return `你正在为微信小程序“遛遛”生成一次城市漫步主题。

用户输入：
- 心情: ${event.mood}
- 天气: ${event.weather}
- 季节: ${event.season}
- 偏好: ${event.preference}
- 地点: ${event.locationName}
- 地点语境: ${event.locationContext}

以下是检索增强上下文（RAG），请优先基于这些信息生成，而不是凭空想象：
${JSON.stringify(ragContext, null, 2)}

生成要求：
1. 主题必须明显体现地点语境和检索到的场景特征。
2. 任务要鼓励观察色彩、纹理、形状、声音或城市生活细节。
3. 任务应安全、可执行，不要引导危险行为或进入受限区域。
4. 避免过度抽象和重复表达。${modeInstruction}
5. 优先使用 RAG 提供的线索和任务样例进行改写、组合、在地化。

返回 JSON：
{
  "title": "主题标题",
  "description": "80字以内的诗意描述",
  "category": "视觉/纹理/声音/城市/探索",
  "missions": ["任务 1", "任务 2", "任务 3"],
  "vibeColor": "十六进制颜色"
}`;
}

module.exports = {
  retrieveContext,
  buildFallbackTheme,
  buildPrompt,
};

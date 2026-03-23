const cloud = require('wx-server-sdk');
const { GoogleGenAI, Type } = require('@google/genai');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const fallbackTheme = {
  title: '未知的漫步',
  description: '在城市纹理中寻找今天的意外和惊喜。',
  category: '探索',
  missions: ['寻找一个让你驻足的细节'],
  vibeColor: '#5a5a40',
};

exports.main = async (event) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { theme: fallbackTheme, source: 'fallback', reason: 'missing_api_key' };
  }

  const ai = new GoogleGenAI({ apiKey });
  const modeInstruction = event.walkMode === 'advanced'
    ? '生成 3 个具体但不过度复杂的任务。'
    : '只生成 1 个宽泛自由的任务。';

  const prompt = `根据以下参数生成一个 City Walk 主题：\n心情: ${event.mood}\n天气: ${event.weather}\n季节: ${event.season}\n偏好: ${event.preference}\n地点: ${event.locationName}\n地点语境: ${event.locationContext}\n模式: ${modeInstruction}\n返回 JSON：title, description, category, missions, vibeColor。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            missions: { type: Type.ARRAY, items: { type: Type.STRING } },
            vibeColor: { type: Type.STRING },
          },
          required: ['title', 'description', 'category', 'missions', 'vibeColor'],
        },
      },
    });

    const theme = JSON.parse(response.text || '{}');
    return { theme: { ...fallbackTheme, ...theme }, source: 'ai' };
  } catch (error) {
    return { theme: fallbackTheme, source: 'fallback', reason: error.message || 'generate_failed' };
  }
};

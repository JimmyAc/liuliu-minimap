const cloud = require('wx-server-sdk');
const { GoogleGenAI } = require('@google/genai');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const placeName = event.placeName || '当前位置';

  if (!apiKey) {
    return { context: placeName === '当前位置' ? '城市街道' : placeName };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `根据地点 ${placeName} 和经纬度 (${event.latitude}, ${event.longitude})，返回该区域简短环境特征，例如老城区、河岸步道、居民街区、商业中心。只返回短语。`,
    });
    return { context: response.text || '城市街道' };
  } catch (error) {
    return { context: '城市街道', reason: error.message || 'context_failed' };
  }
};

const cloud = require('wx-server-sdk');
const { chatText } = require('./ai');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const placeName = event.placeName || '当前位置';

  try {
    const text = await chatText(
      '你是地点语境提炼助手。只返回一个简短中文短语，不要解释，不要换行。',
      `根据地点 ${placeName} 和经纬度 (${event.latitude}, ${event.longitude})，返回该区域简短环境特征，例如老城区、河岸步道、居民街区、商业中心。只返回短语。`
    );
    return { context: text || '城市街道' };
  } catch (error) {
    return {
      context: placeName === '当前位置' ? '城市街道' : placeName,
      reason: error.message || 'context_failed',
    };
  }
};

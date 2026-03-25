const cloud = require('wx-server-sdk');
const { chatText, requestText } = require('./ai');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

async function reverseGeocode(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }

  try {
    const response = await requestText(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
      headers: {
        'User-Agent': 'liuliu-miniapp-location-bot/1.0',
      },
    });
    const payload = JSON.parse(response || '{}');
    const address = payload.address || {};
    const candidate = address.amenity || address.attraction || address.building || address.school || address.university || address.neighbourhood || address.suburb || address.road || payload.name;
    return {
      placeName: candidate || payload.display_name || '当前位置',
      displayName: payload.display_name || candidate || '当前位置',
    };
  } catch (error) {
    return null;
  }
}

exports.main = async (event) => {
  const latitude = Number(event.latitude);
  const longitude = Number(event.longitude);
  const reverse = await reverseGeocode(latitude, longitude);
  const placeName = event.placeName || (reverse && reverse.placeName) || '当前位置';

  try {
    const text = await chatText(
      '你是地点语境提炼助手。只返回一个简短中文短语，不要解释，不要换行。',
      `根据地点 ${placeName}、补充地点信息 ${(reverse && reverse.displayName) || placeName} 和经纬度 (${event.latitude}, ${event.longitude})，返回该区域简短环境特征，例如大学校园、河岸步道、居民街区、商业中心。优先使用更具体的场景标签。只返回短语。`
    );
    return {
      context: text || '城市街道',
      placeName,
    };
  } catch (error) {
    return {
      context: placeName === '当前位置' ? '城市街道' : placeName,
      placeName,
      reason: error.message || 'context_failed',
    };
  }
};

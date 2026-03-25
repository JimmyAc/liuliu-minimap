const cloud = require('wx-server-sdk');
const { chatVisionJson } = require('./ai');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

async function getImageUrls(fileIDs) {
  if (!fileIDs || !fileIDs.length) {
    return [];
  }

  const result = await cloud.getTempFileURL({ fileList: fileIDs });
  return (result.fileList || [])
    .map((item) => item.tempFileURL)
    .filter(Boolean);
}

exports.main = async (event) => {
  const mission = event.mission || '';
  const noteText = event.noteText || '';
  const fileIDs = Array.isArray(event.fileIDs) ? event.fileIDs.filter(Boolean) : [];

  if (!mission || !fileIDs.length) {
    return {
      passed: false,
      comment: '请至少上传一张图片，再让 AI 帮你判断是否完成了任务。',
      reason: 'missing_input',
    };
  }

  try {
    const imageUrls = await getImageUrls(fileIDs);
    const result = await chatVisionJson(
      '你是遛遛小程序的任务核验助手。请采用宽松、鼓励式标准判断用户是否完成了任务。只返回 JSON，字段为 passed、comment、confidence。即使不通过，也给简短温和评价。',
      `任务内容：${mission}\n用户备注：${noteText || '无'}\n请宽松判断这些图片和备注是否基本符合任务意图。`,
      imageUrls
    );

    return {
      passed: !!result.passed,
      confidence: result.confidence || 'medium',
      comment: result.comment || (result.passed ? '这组记录和任务意图比较贴近，已经为你点亮任务。' : '这组记录已经很接近了，可以再补一张更贴近任务主题的图片。'),
      reviewedAt: Date.now(),
    };
  } catch (error) {
    return {
      passed: true,
      confidence: 'fallback',
      comment: 'AI 识别暂时较慢，已按宽松标准先为你记录这次打卡。',
      reviewedAt: Date.now(),
      reason: error.message || 'verify_failed',
    };
  }
};

const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const limit = Math.min(Number(event.limit || 20), 50);
  const result = await db.collection('walkRecords')
    .where({ isPublic: true })
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return { records: result.data };
};

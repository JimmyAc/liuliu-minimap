const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();

  const payload = {
    userId: wxContext.OPENID,
    themeTitle: event.themeSnapshot.title,
    themeSnapshot: event.themeSnapshot,
    locationName: event.locationName || '当前位置',
    locationContext: event.locationContext || '城市街道',
    routePoints: event.routePoints || [],
    missionsCompleted: event.missionsCompleted || [],
    photoList: event.photoList || [],
    coverImage: (event.photoList || [])[0] || '',
    noteText: event.noteText || '',
    isPublic: !!event.isPublic,
    createdAt: Date.now(),
  };

  const result = await db.collection('walkRecords').add({ data: payload });
  return { ok: true, id: result._id };
};

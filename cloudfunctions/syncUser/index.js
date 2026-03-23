const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const collection = db.collection('users');
  const profile = event.profile || {};

  try {
    await collection.doc(openid).get();
    await collection.doc(openid).update({
      data: {
        nickName: profile.nickName || '微信用户',
        avatarUrl: profile.avatarUrl || '',
        lastLoginAt: db.serverDate(),
      },
    });
  } catch (error) {
    await collection.doc(openid).set({
      data: {
        openid,
        nickName: profile.nickName || '微信用户',
        avatarUrl: profile.avatarUrl || '',
        role: 'user',
        createdAt: db.serverDate(),
        lastLoginAt: db.serverDate(),
      },
    });
  }

  const userDoc = await collection.doc(openid).get();
  return { user: userDoc.data, openid };
};

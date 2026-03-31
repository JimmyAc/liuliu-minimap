function chooseImage(count = 9) {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      success: resolve,
      fail: reject,
    });
  });
}

function chooseVideo(count = 1) {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count,
      mediaType: ['video'],
      sourceType: ['camera', 'album'],
      maxDuration: 60,
      camera: 'back',
      success: resolve,
      fail: reject,
    });
  });
}

module.exports = {
  chooseImage,
  chooseVideo,
};

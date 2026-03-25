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

module.exports = {
  chooseImage,
};

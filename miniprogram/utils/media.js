function chooseImage() {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: 1,
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

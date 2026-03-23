function chooseLocation() {
  return new Promise((resolve, reject) => {
    wx.chooseLocation({
      success: resolve,
      fail: reject,
    });
  });
}

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: resolve,
      fail: reject,
    });
  });
}

module.exports = {
  chooseLocation,
  getCurrentLocation,
};

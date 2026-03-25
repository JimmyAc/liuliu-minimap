const { cloudEnvId } = require('./utils/config');
const { loadDraft, saveDraft } = require('./utils/draft');

App({
  globalData: {
    user: null,
    walkDraft: loadDraft(),
    currentTheme: null,
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('wx.cloud is not available in current base library');
      return;
    }

    wx.cloud.init({
      env: cloudEnvId,
      traceUser: true,
    });
  },

  setWalkDraft(nextDraft) {
    this.globalData.walkDraft = nextDraft;
    saveDraft(nextDraft);
  },

  clearWalkDraft() {
    this.globalData.walkDraft = loadDraft(true);
    saveDraft(this.globalData.walkDraft);
  },
});

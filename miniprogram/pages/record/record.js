const app = getApp();
const { createWalk } = require('../../services/walk');
const { getCurrentLocation } = require('../../utils/location');
const { chooseImage } = require('../../utils/media');

let routeTimer = null;

Page({
  data: {
    theme: null,
    draft: null,
    isTracking: false,
    isSaving: false,
  },

  onShow() {
    this.refreshState();
  },

  onUnload() {
    this.stopTracking();
  },

  refreshState() {
    this.setData({
      theme: app.globalData.currentTheme,
      draft: app.globalData.walkDraft,
    });
  },

  toggleMission(event) {
    const mission = event.detail.mission;
    const completed = new Set(this.data.draft.completedMissions);
    if (completed.has(mission)) {
      completed.delete(mission);
    } else {
      completed.add(mission);
    }
    const draft = { ...this.data.draft, completedMissions: Array.from(completed) };
    app.setWalkDraft(draft);
    this.refreshState();
  },

  handleNoteInput(event) {
    const draft = { ...this.data.draft, noteText: event.detail.value };
    app.setWalkDraft(draft);
    this.refreshState();
  },

  handleVisibilityChange(event) {
    const draft = { ...this.data.draft, isPublic: !!event.detail.value.length };
    app.setWalkDraft(draft);
    this.refreshState();
  },

  async choosePhoto() {
    try {
      const result = await chooseImage();
      const photoPath = result.tempFiles[0].tempFilePath;
      const draft = { ...this.data.draft, photoList: [...this.data.draft.photoList, photoPath] };
      app.setWalkDraft(draft);
      this.refreshState();
    } catch (error) {
      if (error && error.errMsg && error.errMsg.includes('cancel')) {
        return;
      }
      wx.showToast({ title: '选择图片失败', icon: 'none' });
    }
  },

  removePhoto(event) {
    const index = Number(event.currentTarget.dataset.index);
    const photoList = [...this.data.draft.photoList];
    photoList.splice(index, 1);
    const draft = { ...this.data.draft, photoList };
    app.setWalkDraft(draft);
    this.refreshState();
  },

  async toggleTracking() {
    if (this.data.isTracking) {
      this.stopTracking();
      return;
    }

    this.setData({ isTracking: true });
    await this.capturePoint();
    routeTimer = setInterval(() => {
      this.capturePoint();
    }, 10000);
  },

  stopTracking() {
    if (routeTimer) {
      clearInterval(routeTimer);
      routeTimer = null;
    }
    this.setData({ isTracking: false });
  },

  async capturePoint() {
    try {
      const location = await getCurrentLocation();
      const draft = {
        ...app.globalData.walkDraft,
        latitude: location.latitude,
        longitude: location.longitude,
        routePoints: [
          ...app.globalData.walkDraft.routePoints,
          { latitude: location.latitude, longitude: location.longitude, timestamp: Date.now() },
        ],
      };
      app.setWalkDraft(draft);
      this.refreshState();
    } catch (error) {
      this.stopTracking();
      wx.showToast({ title: '轨迹记录失败', icon: 'none' });
    }
  },

  async handleSave() {
    if (!this.data.theme) {
      wx.showToast({ title: '缺少主题信息', icon: 'none' });
      return;
    }

    this.setData({ isSaving: true });
    try {
      const uploadedPhotos = await Promise.all((this.data.draft.photoList || []).map((path) => this.uploadPhoto(path)));
      const result = await createWalk({
        themeSnapshot: this.data.theme,
        locationName: this.data.draft.locationName,
        locationContext: this.data.draft.locationContext,
        routePoints: this.data.draft.routePoints,
        missionsCompleted: this.data.draft.completedMissions,
        photoList: uploadedPhotos,
        noteText: this.data.draft.noteText,
        isPublic: this.data.draft.isPublic,
      });
      this.stopTracking();
      app.clearWalkDraft();
      app.globalData.currentTheme = null;
      wx.showToast({ title: '已保存', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/history/history' });
      }, 500);
      return result;
    } catch (error) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ isSaving: false });
      this.refreshState();
    }
  },

  uploadPhoto(filePath) {
    const cloudPath = `walks/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    return wx.cloud.uploadFile({ cloudPath, filePath }).then((response) => response.fileID);
  },
});

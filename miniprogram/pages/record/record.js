const app = getApp();
const { createWalk } = require('../../services/walk');
const { requestUpload } = require('../../services/api');
const { getCurrentLocation } = require('../../utils/location');
const { chooseImage, chooseVideo } = require('../../utils/media');
const { verifyMission } = require('../../services/theme');

let routeTimer = null;
let recorderManager = null;

Page({
  data: {
    activeMission: '',
    isVerifyingMission: false,
    theme: null,
    draft: null,
    isTracking: false,
    isSaving: false,
    isMapOpen: false,
    isRecordingAudio: false,
    expandedMission: '',
  },

  onLoad() {
    if (wx.getRecorderManager) {
      recorderManager = wx.getRecorderManager();
      recorderManager.onStop((result) => {
        const audioList = [...((this.data.draft && this.data.draft.audioList) || [])];
        audioList.push({
          tempFilePath: result.tempFilePath,
          duration: result.duration || 0,
        });
        const draft = { ...app.globalData.walkDraft, audioList };
        app.setWalkDraft(draft);
        this.setData({ isRecordingAudio: false });
        this.refreshState();
      });
      recorderManager.onError(() => {
        this.setData({ isRecordingAudio: false });
        wx.showToast({ title: '录音失败', icon: 'none' });
      });
    }
  },

  onShow() {
    this.refreshState();
  },

  onUnload() {
    this.stopTracking();
    if (this.data.isRecordingAudio && recorderManager) {
      recorderManager.stop();
    }
  },

  refreshState() {
    const theme = app.globalData.currentTheme;
    const draft = app.globalData.walkDraft;
    this.setData({
      activeMission: draft.selectedMission || this.data.activeMission || ((theme && theme.missions && theme.missions[0]) || ''),
      theme,
      draft,
    });
  },

  setDraft(nextDraft) {
    app.setWalkDraft(nextDraft);
    this.refreshState();
  },

  selectMission(event) {
    const mission = event.detail.mission;
    const draft = { ...this.data.draft, selectedMission: mission };
    this.setDraft(draft);
    this.setData({
      activeMission: mission,
      expandedMission: this.data.expandedMission === mission ? '' : mission,
    });
  },

  toggleMissionDone(event) {
    const mission = event.detail.mission;
    const completed = new Set(this.data.draft.completedMissions || []);
    if (completed.has(mission)) {
      completed.delete(mission);
    } else {
      completed.add(mission);
    }
    const draft = { ...this.data.draft, completedMissions: Array.from(completed), selectedMission: mission };
    this.setDraft(draft);
  },

  async handleMissionVerify(event) {
    const mission = event.detail.mission || this.data.activeMission;
    if (mission) {
      const draft = { ...this.data.draft, selectedMission: mission };
      this.setDraft(draft);
      this.setData({ activeMission: mission });
    }
    wx.showActionSheet({
      itemList: ['拍照', '录像', '录音'],
      success: async (res) => {
        if (res.tapIndex === 0) {
          await this.choosePhoto();
          return;
        }
        if (res.tapIndex === 1) {
          await this.chooseVideo();
          return;
        }
        this.toggleAudioRecording();
      },
    });
  },

  markMissionPassed(mission, review) {
    const completed = new Set(this.data.draft.completedMissions || []);
    completed.add(mission);
    const missionReviews = {
      ...(this.data.draft.missionReviews || {}),
      [mission]: review,
    };
    const draft = { ...this.data.draft, completedMissions: Array.from(completed), missionReviews, selectedMission: mission };
    this.setDraft(draft);
  },

  saveMissionReview(mission, review) {
    const missionReviews = {
      ...(this.data.draft.missionReviews || {}),
      [mission]: review,
    };
    const draft = { ...this.data.draft, missionReviews, selectedMission: mission };
    this.setDraft(draft);
  },

  handleNoteInput(event) {
    const draft = { ...this.data.draft, noteText: event.detail.value };
    this.setDraft(draft);
  },

  async choosePhoto() {
    try {
      const result = await chooseImage(9);
      const photoPaths = (result.tempFiles || []).map((item) => item.tempFilePath).filter(Boolean);
      const draft = { ...this.data.draft, photoList: [...(this.data.draft.photoList || []), ...photoPaths] };
      this.setDraft(draft);
    } catch (error) {
      if (error && error.errMsg && error.errMsg.includes('cancel')) {
        return;
      }
      wx.showToast({ title: '选择图片失败', icon: 'none' });
    }
  },

  async chooseVideo() {
    try {
      const result = await chooseVideo(3);
      const videoList = [...(this.data.draft.videoList || []), ...(result.tempFiles || []).map((item) => ({
        tempFilePath: item.tempFilePath,
        duration: item.duration || 0,
        size: item.size || 0,
      }))];
      this.setDraft({ ...this.data.draft, videoList });
    } catch (error) {
      if (error && error.errMsg && error.errMsg.includes('cancel')) {
        return;
      }
      wx.showToast({ title: '选择视频失败', icon: 'none' });
    }
  },

  toggleAudioRecording() {
    if (!recorderManager) {
      wx.showToast({ title: '当前环境不支持录音', icon: 'none' });
      return;
    }

    if (this.data.isRecordingAudio) {
      recorderManager.stop();
      return;
    }

    recorderManager.start({
      duration: 60000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3',
    });
    this.setData({ isRecordingAudio: true });
  },

  async verifyActiveMission() {
    const mission = this.data.activeMission;
    if (!mission) {
      wx.showToast({ title: '先选择一个任务', icon: 'none' });
      return;
    }

    if (!(this.data.draft.photoList || []).length) {
      wx.showToast({ title: '请先上传图片再核验', icon: 'none' });
      return;
    }

    this.setData({ isVerifyingMission: true });
    try {
      const uploadedPhotos = await Promise.all((this.data.draft.photoList || []).map((path) => this.uploadAsset(path, 'image')));
      const review = await verifyMission({
        mission,
        noteText: this.data.draft.noteText,
        fileIDs: uploadedPhotos,
      });
      const nextReview = {
        passed: !!review.passed,
        comment: review.comment,
        confidence: review.confidence || 'medium',
        reviewedAt: review.reviewedAt || Date.now(),
        photoList: uploadedPhotos,
      };
      if (review.passed) {
        this.markMissionPassed(mission, nextReview);
      } else {
        this.saveMissionReview(mission, nextReview);
      }
      wx.showToast({ title: review.passed ? '核验通过' : '已给出建议', icon: 'none' });
    } catch (error) {
      wx.showToast({ title: '核验失败', icon: 'none' });
    } finally {
      this.setData({ isVerifyingMission: false });
    }
  },

  removePhoto(event) {
    const index = Number(event.currentTarget.dataset.index);
    const photoList = [...(this.data.draft.photoList || [])];
    photoList.splice(index, 1);
    this.setDraft({ ...this.data.draft, photoList });
  },

  removeVideo(event) {
    const index = Number(event.currentTarget.dataset.index);
    const videoList = [...(this.data.draft.videoList || [])];
    videoList.splice(index, 1);
    this.setDraft({ ...this.data.draft, videoList });
  },

  removeAudio(event) {
    const index = Number(event.currentTarget.dataset.index);
    const audioList = [...(this.data.draft.audioList || [])];
    audioList.splice(index, 1);
    this.setDraft({ ...this.data.draft, audioList });
  },

  async toggleTracking() {
    if (this.data.isTracking) {
      this.stopTracking();
      return;
    }

    this.setData({ isTracking: true, isMapOpen: true });
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
          ...(app.globalData.walkDraft.routePoints || []),
          { latitude: location.latitude, longitude: location.longitude, timestamp: Date.now() },
        ],
      };
      this.setDraft(draft);
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
      const uploadedPhotos = await Promise.all((this.data.draft.photoList || []).map((path) => this.uploadAsset(path, 'image')));
      const uploadedVideos = await Promise.all((this.data.draft.videoList || []).map((item) => this.uploadAsset(item.tempFilePath, 'video')));
      const uploadedAudios = await Promise.all((this.data.draft.audioList || []).map((item) => this.uploadAsset(item.tempFilePath, 'audio')));
      const result = await createWalk({
        themeSnapshot: this.data.theme,
        themeTitle: this.data.theme.title,
        locationName: this.data.draft.locationName,
        locationContext: this.data.draft.locationContext,
        locationAddress: this.data.draft.locationAddress,
        routePoints: this.data.draft.routePoints,
        missionsCompleted: this.data.draft.completedMissions,
        missionReviews: this.data.draft.missionReviews,
        photoList: uploadedPhotos,
        videoList: uploadedVideos,
        audioList: uploadedAudios,
        noteText: this.data.draft.noteText,
        isPublic: false,
        walkMode: this.data.draft.walkMode,
        generationSource: this.data.draft.generationSource,
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

  uploadAsset(filePath, kind) {
    if (!filePath || String(filePath).startsWith('cloud://') || String(filePath).startsWith('http')) {
      return Promise.resolve(filePath);
    }
    return requestUpload(filePath, { kind });
  },

  noop() {},
});

const app = getApp();
const { PRESET_THEMES, MOODS, WEATHERS, SEASONS, PREFERENCES } = require('../../utils/constants');
const { chooseLocation, explainLocationError, getCurrentLocation } = require('../../utils/location');
const { generateTheme, getLocationContext } = require('../../services/theme');

Page({
  data: {
    currentTheme: null,
    moodOptions: MOODS,
    weatherOptions: WEATHERS,
    seasonOptions: SEASONS,
    preferenceOptions: PREFERENCES,
    mood: MOODS[0],
    weather: WEATHERS[0],
    season: SEASONS[0],
    preference: PREFERENCES[2],
    locationName: '当前位置',
    locationContext: '城市街道',
    latitude: null,
    longitude: null,
    walkMode: 'pure',
    isGenerating: false,
  },

  onLoad() {
    const randomTheme = PRESET_THEMES[Math.floor(Math.random() * PRESET_THEMES.length)];
    const currentTheme = { ...randomTheme, locationName: '当前位置' };
    this.setData({ currentTheme });
    app.globalData.currentTheme = currentTheme;
  },

  setOption(event) {
    const { field, value } = event.currentTarget.dataset;
    this.setData({ [field]: value });
  },

  async useCurrentLocation() {
    try {
      wx.showLoading({ title: '定位中' });
      const result = await getCurrentLocation();
      const contextResponse = await getLocationContext({ latitude: result.latitude, longitude: result.longitude });
      this.setData({
        latitude: result.latitude,
        longitude: result.longitude,
        locationName: '当前位置',
        locationContext: contextResponse.context || '城市街道',
      });
    } catch (error) {
      wx.showToast({ title: explainLocationError(error, '定位'), icon: 'none', duration: 2500 });
    } finally {
      wx.hideLoading();
    }
  },

  async handleChooseLocation() {
    try {
      const location = await chooseLocation();
      wx.showLoading({ title: '分析地点' });
      const contextResponse = await getLocationContext({
        latitude: location.latitude,
        longitude: location.longitude,
        placeName: location.name || location.address,
      });
      this.setData({
        latitude: location.latitude,
        longitude: location.longitude,
        locationName: location.name || location.address || '已选地点',
        locationContext: contextResponse.context || '城市街道',
      });
    } catch (error) {
      if (error && error.errMsg && error.errMsg.includes('cancel')) {
        return;
      }
      wx.showToast({ title: explainLocationError(error, '选点'), icon: 'none', duration: 2500 });
    } finally {
      wx.hideLoading();
    }
  },

  async handleGenerateTheme() {
    this.setData({ isGenerating: true });
    try {
      const result = await generateTheme({
        mood: this.data.mood,
        weather: this.data.weather,
        season: this.data.season,
        preference: this.data.preference,
        locationName: this.data.locationName,
        locationContext: this.data.locationContext,
        walkMode: this.data.walkMode,
      });
      const currentTheme = { ...result.theme, locationName: this.data.locationName };
      this.setData({ currentTheme });
      app.globalData.currentTheme = currentTheme;
    } catch (error) {
      wx.showToast({ title: '主题生成失败', icon: 'none' });
    } finally {
      this.setData({ isGenerating: false });
    }
  },

  handleStartWalk() {
    if (!this.data.currentTheme) {
      return;
    }

    app.globalData.currentTheme = this.data.currentTheme;
    const draft = {
      ...app.globalData.walkDraft,
      startedAt: Date.now(),
      locationName: this.data.locationName,
      locationContext: this.data.locationContext,
      latitude: this.data.latitude,
      longitude: this.data.longitude,
    };
    app.setWalkDraft(draft);
    wx.navigateTo({ url: '/pages/record/record' });
  },
});

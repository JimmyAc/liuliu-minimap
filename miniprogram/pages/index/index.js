const app = getApp();
const { COMBINE_THEME_OPTIONS, PRESET_THEMES, RANDOM_THEME_CATEGORIES, MOODS, WEATHERS, SEASONS, PREFERENCES } = require('../../utils/constants');
const { chooseLocation, explainLocationError, getCurrentLocation } = require('../../utils/location');
const { generateCombinedTheme, generateRandomTheme, generateTheme, getLocationContext } = require('../../services/theme');

function normalizeMissionText(mission) {
  if (typeof mission === 'string') {
    const trimmed = mission.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return normalizeMissionText(JSON.parse(trimmed));
      } catch (error) {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (mission && typeof mission === 'object') {
    if (typeof mission.name === 'string' && typeof mission.description === 'string') {
      return `${mission.name}：${mission.description}`;
    }
    return mission.text || mission.title || mission.label || mission.mission || mission.name || JSON.stringify(mission);
  }
  return String(mission);
}

function trimTheme(theme, walkMode) {
  const missionCount = walkMode === 'advanced' ? 3 : 1;
  const rawMissions = theme.allMissions || theme.missions || [];
  const allMissions = rawMissions.map(normalizeMissionText);
  return {
    ...theme,
    allMissions,
    missions: allMissions.slice(0, missionCount),
  };
}

function buildCombineOptionViews(selected) {
  const set = new Set(selected || []);
  return COMBINE_THEME_OPTIONS.map((item) => ({
    label: item,
    active: set.has(item),
  }));
}

Page({
  data: {
    combineOptionViews: buildCombineOptionViews([]),
    combineSelections: [],
    currentTheme: null,
    currentThemeSource: 'preset',
    displaySummary: '当前展示的是系统预设主题。',
    displayTag: '展示栏',
    isCombining: false,
    moodOptions: MOODS,
    weatherOptions: WEATHERS,
    seasonOptions: SEASONS,
    preferenceOptions: PREFERENCES,
    randomCategories: RANDOM_THEME_CATEGORIES,
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
    const currentTheme = trimTheme({ ...randomTheme, locationName: '当前位置', allMissions: randomTheme.missions }, this.data.walkMode);
    this.setData({ currentTheme });
    app.globalData.currentTheme = currentTheme;
    this.syncDisplayMeta(currentTheme, 'preset');
  },

  syncDisplayMeta(theme, source, walkMode = this.data.walkMode) {
    const modeLabel = walkMode === 'advanced' ? '进阶模式' : '纯粹模式';
    const sourceLabelMap = {
      preset: '预设展示',
      'rag+ai': 'AI 生成',
      'rag-fallback': 'RAG 兜底',
      'random+ai': '随机 AI',
      'random-fallback': '随机兜底',
      'combined+ai': '组合 AI',
      'combined-fallback': '组合兜底',
    };
    const sourceLabel = sourceLabelMap[source] || '主题结果';
    this.setData({
      currentThemeSource: source,
      displayTag: sourceLabel,
      displaySummary: `${modeLabel} · ${theme.category || '探索'} · ${theme.missions ? theme.missions.length : 0} 个任务`,
    });
  },

  setOption(event) {
    const { field, value } = event.currentTarget.dataset;
    this.setData({ [field]: value });
    if (field === 'walkMode' && this.data.currentTheme) {
      const nextTheme = trimTheme(this.data.currentTheme, value);
      this.setData({ currentTheme: nextTheme });
      app.globalData.currentTheme = nextTheme;
      this.syncDisplayMeta(nextTheme, this.data.currentThemeSource, value);
    }
  },

  toggleCombineSelection(event) {
    const value = event.currentTarget.dataset.value;
    const current = new Set(this.data.combineSelections);
    if (current.has(value)) {
      current.delete(value);
    } else if (current.size < 3) {
      current.add(value);
    }
    const combineSelections = Array.from(current);
    this.setData({ combineSelections, combineOptionViews: buildCombineOptionViews(combineSelections) });
  },

  async useCurrentLocation() {
    try {
      wx.showLoading({ title: '定位中' });
      const result = await getCurrentLocation();
      const contextResponse = await getLocationContext({ latitude: result.latitude, longitude: result.longitude });
      this.setData({
        latitude: result.latitude,
        longitude: result.longitude,
        locationName: contextResponse.placeName || '当前位置',
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
        locationName: contextResponse.placeName || location.name || location.address || '已选地点',
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
      const currentTheme = trimTheme({ ...result.theme, allMissions: result.theme.missions, locationName: this.data.locationName }, this.data.walkMode);
      this.setData({ currentTheme });
      app.globalData.currentTheme = currentTheme;
      this.syncDisplayMeta(currentTheme, result.source || 'rag-fallback');
    } catch (error) {
      wx.showToast({ title: '主题生成失败', icon: 'none' });
    } finally {
      this.setData({ isGenerating: false });
    }
  },

  async handleRandomTheme() {
    this.setData({ isGenerating: true });
    try {
      const category = this.data.randomCategories[Math.floor(Math.random() * this.data.randomCategories.length)];
      const result = await generateRandomTheme({
        category,
        locationName: this.data.locationName,
        locationContext: this.data.locationContext,
        walkMode: this.data.walkMode,
      });
      const currentTheme = trimTheme({ ...result.theme, allMissions: result.theme.missions, locationName: this.data.locationName }, this.data.walkMode);
      this.setData({ currentTheme });
      app.globalData.currentTheme = currentTheme;
      this.syncDisplayMeta(currentTheme, result.source || 'random-fallback');
    } catch (error) {
      wx.showToast({ title: '随机主题失败', icon: 'none' });
    } finally {
      this.setData({ isGenerating: false });
    }
  },

  async handleCombinedTheme() {
    if (this.data.combineSelections.length < 2) {
      wx.showToast({ title: '至少选择两个方向', icon: 'none' });
      return;
    }

    this.setData({ isCombining: true });
    try {
      const result = await generateCombinedTheme({
        categories: this.data.combineSelections,
        locationName: this.data.locationName,
        locationContext: this.data.locationContext,
        walkMode: this.data.walkMode,
      });
      const currentTheme = trimTheme({ ...result.theme, allMissions: result.theme.missions, locationName: this.data.locationName }, this.data.walkMode);
      this.setData({ currentTheme });
      app.globalData.currentTheme = currentTheme;
      this.syncDisplayMeta(currentTheme, result.source || 'combined-fallback');
    } catch (error) {
      wx.showToast({ title: '组合主题失败', icon: 'none' });
    } finally {
      this.setData({ isCombining: false });
    }
  },

  handleStartWalk() {
    if (!this.data.currentTheme) {
      return;
    }

    app.globalData.currentTheme = this.data.currentTheme;
    const draft = {
      ...app.globalData.walkDraft,
      completedMissions: [],
      startedAt: Date.now(),
      locationName: this.data.locationName,
      locationContext: this.data.locationContext,
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      missionReviews: {},
      noteText: '',
      photoList: [],
      routePoints: [],
      walkMode: this.data.walkMode,
      generationSource: this.data.currentThemeSource,
    };
    app.setWalkDraft(draft);
    wx.navigateTo({ url: '/pages/record/record' });
  },
});

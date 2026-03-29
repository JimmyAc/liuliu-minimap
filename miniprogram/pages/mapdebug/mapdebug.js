const { amapKey } = require('../../utils/config');
const { getCurrentLocation, explainLocationError } = require('../../utils/location');
const { AMapWX } = require('../../libs/amap-wx.130');

function createMarker(item, index, active) {
  return {
    id: index,
    latitude: Number(item.latitude),
    longitude: Number(item.longitude),
    width: active ? 36 : 28,
    height: active ? 36 : 28,
    alpha: 1,
    callout: {
      content: item.name || '已选地点',
      color: '#1a1a1a',
      fontSize: 12,
      borderRadius: 10,
      padding: 8,
      display: 'BYCLICK',
      bgColor: '#ffffff',
    },
  };
}

function flattenWalkingSteps(paths) {
  const points = [];
  ((paths && paths[0] && paths[0].steps) || []).forEach((step) => {
    String(step.polyline || '')
      .split(';')
      .filter(Boolean)
      .forEach((pair) => {
        const [longitude, latitude] = pair.split(',').map(Number);
        if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
          points.push({ longitude, latitude });
        }
      });
  });
  return points;
}

Page({
  data: {
    keyReady: amapKey && !String(amapKey).includes('请替换'),
    latitude: 39.908823,
    longitude: 116.39747,
    scale: 15,
    searchKeyword: '',
    locationName: '等待定位',
    locationDesc: '先填好高德 key，再点“获取当前位置”',
    searchResults: [],
    markers: [],
    circles: [],
    polyline: [],
    activePoiIndex: -1,
  },

  onLoad() {
    this.mapCtx = wx.createMapContext('citywalk-map', this);
    if (this.data.keyReady) {
      this.amap = new AMapWX({ key: amapKey });
    }
  },

  ensureAmapReady() {
    if (!this.data.keyReady) {
      wx.showToast({ title: '先在 utils/config.js 填高德 key', icon: 'none', duration: 2500 });
      return false;
    }
    if (!this.amap) {
      this.amap = new AMapWX({ key: amapKey });
    }
    return true;
  },

  setSearchKeyword(event) {
    this.setData({ searchKeyword: event.detail.value });
  },

  async useCurrentLocation() {
    try {
      const location = await getCurrentLocation();
      const circles = [{
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 3000,
        color: '#5a5a40',
        fillColor: '#5a5a4022',
        strokeWidth: 2,
      }];
      this.setData({
        latitude: location.latitude,
        longitude: location.longitude,
        locationName: '当前位置',
        locationDesc: `经纬度 ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
        circles,
        markers: [createMarker(location, 0, true)],
        activePoiIndex: 0,
        polyline: [],
      });
      this.fetchRegeo(location.longitude, location.latitude);
      this.fetchPoiAround(location.longitude, location.latitude);
    } catch (error) {
      wx.showToast({ title: explainLocationError(error, '定位'), icon: 'none', duration: 2500 });
    }
  },

  fetchRegeo(longitude, latitude) {
    if (!this.ensureAmapReady()) {
      return;
    }
    this.amap.getRegeo({
      location: `${longitude},${latitude}`,
      success: (result) => {
        const item = result && result[0] ? result[0] : null;
        if (!item) {
          return;
        }
        this.setData({
          locationName: item.name || '当前位置',
          locationDesc: item.desc || '已获取逆地理结果',
        });
      },
      fail: () => {
        wx.showToast({ title: '逆地理解析失败', icon: 'none' });
      },
    });
  },

  fetchPoiAround(longitude, latitude) {
    if (!this.ensureAmapReady()) {
      return;
    }
    this.amap.getPoiAround({
      location: `${longitude},${latitude}`,
      success: (result) => {
        const pois = (result.poisData || []).slice(0, 10).map((item) => ({
          name: item.name,
          address: item.address,
          latitude: Number(String(item.location).split(',')[1]),
          longitude: Number(String(item.location).split(',')[0]),
        }));
        const markers = pois.map((item, index) => createMarker(item, index, index === 0));
        this.setData({
          searchResults: pois,
          markers: markers.length ? markers : this.data.markers,
          activePoiIndex: markers.length ? 0 : this.data.activePoiIndex,
        });
      },
      fail: () => {
        wx.showToast({ title: '周边 POI 获取失败', icon: 'none' });
      },
    });
  },

  searchTips() {
    const keyword = (this.data.searchKeyword || '').trim();
    if (!keyword) {
      wx.showToast({ title: '先输入关键词', icon: 'none' });
      return;
    }
    if (!this.ensureAmapReady()) {
      return;
    }
    this.amap.getInputtips({
      keywords: keyword,
      location: `${this.data.longitude},${this.data.latitude}`,
      citylimit: false,
      success: (result) => {
        const searchResults = (result.tips || [])
          .filter((item) => item.location)
          .map((item) => ({
            name: item.name || item.address || '地点',
            address: item.district || item.address || '',
            latitude: Number(String(item.location).split(',')[1]),
            longitude: Number(String(item.location).split(',')[0]),
          }));
        this.setData({ searchResults });
      },
      fail: () => {
        wx.showToast({ title: '搜索建议失败', icon: 'none' });
      },
    });
  },

  choosePoi(event) {
    const index = Number(event.currentTarget.dataset.index);
    const poi = this.data.searchResults[index];
    if (!poi) {
      return;
    }

    const markers = this.data.searchResults.map((item, idx) => createMarker(item, idx, idx === index));
    const circles = [{
      latitude: poi.latitude,
      longitude: poi.longitude,
      radius: 3000,
      color: '#5a5a40',
      fillColor: '#5a5a4022',
      strokeWidth: 2,
    }];

    this.setData({
      latitude: poi.latitude,
      longitude: poi.longitude,
      locationName: poi.name,
      locationDesc: poi.address || '已选中地点',
      markers,
      circles,
      activePoiIndex: index,
      polyline: [],
    });
    this.mapCtx.moveToLocation({
      longitude: poi.longitude,
      latitude: poi.latitude,
    });
  },

  markerTap(event) {
    const index = Number(event.detail.markerId);
    this.choosePoi({ currentTarget: { dataset: { index } } });
  },

  planWalkingRoute() {
    const active = this.data.searchResults[this.data.activePoiIndex];
    if (!active) {
      wx.showToast({ title: '先选一个地点', icon: 'none' });
      return;
    }
    if (!this.ensureAmapReady()) {
      return;
    }

    const destination = `${active.longitude},${active.latitude}`;
    const origin = `${this.data.longitude},${this.data.latitude}`;
    this.amap.getWalkingRoute({
      origin,
      destination,
      success: (result) => {
        const points = flattenWalkingSteps(result.paths);
        this.setData({
          polyline: points.length
            ? [{
                points,
                color: '#5a5a40',
                width: 4,
              }]
            : [],
        });
      },
      fail: () => {
        wx.showToast({ title: '步行路线规划失败', icon: 'none' });
      },
    });
  },

  regionChange(event) {
    if (event.type === 'end') {
      this.mapCtx.getCenterLocation({
        success: (res) => {
          this.setData({
            latitude: res.latitude,
            longitude: res.longitude,
          });
        },
      });
    }
  },
});

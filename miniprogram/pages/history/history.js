const { listMyWalks } = require('../../services/walk');
const { formatDate } = require('../../utils/format');

Page({
  data: {
    walks: [],
    loading: false,
  },

  onShow() {
    this.fetchWalks();
  },

  async fetchWalks() {
    this.setData({ loading: true });
    try {
      const result = await listMyWalks({ limit: 20 });
      const walks = (result.records || []).map((item) => ({
        ...item,
        createdAtLabel: formatDate(item.createdAt),
      }));
      this.setData({ walks });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  openDetail(event) {
    const id = event.detail.id;
    if (!id) {
      return;
    }
    wx.navigateTo({ url: `/pages/walk-detail/walk-detail?id=${id}&source=history` });
  },
});

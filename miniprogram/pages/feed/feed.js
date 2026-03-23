const { listPublicWalks } = require('../../services/walk');
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
      const result = await listPublicWalks({ limit: 20 });
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
});

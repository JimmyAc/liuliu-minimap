const { apiBaseUrl, apiPrefix, requestTimeout } = require('../utils/config');
const { callCloud, uploadToCloud } = require('./cloud');

const ENDPOINTS = {
  syncUser: { path: '/users/sync', method: 'POST', cloudName: 'syncUser' },
  generateTheme: { path: '/themes/generate', method: 'POST', cloudName: 'generateTheme' },
  generateRandomTheme: { path: '/themes/random', method: 'POST', cloudName: 'generateRandomTheme' },
  generateCombinedTheme: { path: '/themes/combined', method: 'POST', cloudName: 'generateCombinedTheme' },
  getLocationContext: { path: '/locations/context', method: 'POST', cloudName: 'getLocationContext' },
  verifyMission: { path: '/missions/verify', method: 'POST', cloudName: 'verifyMission' },
  createWalk: { path: '/walks', method: 'POST', cloudName: 'createWalk' },
  listMyWalks: { path: '/walks/mine', method: 'GET', cloudName: 'listMyWalks' },
  listPublicWalks: { path: '/walks/public', method: 'GET', cloudName: 'listPublicWalks' },
  getWalkDetail: { path: '/walks/detail', method: 'GET', cloudName: 'getWalkDetail' },
  uploadMedia: { path: '/uploads/media', method: 'UPLOAD', cloudName: '' },
};

function getBackendProvider() {
  return apiBaseUrl ? 'web' : 'cloud';
}

function normalizeResponse(response) {
  if (response && typeof response === 'object') {
    if (Object.prototype.hasOwnProperty.call(response, 'data')) {
      return response.data;
    }
    return response;
  }
  return {};
}

function buildUrl(path) {
  const base = apiBaseUrl.replace(/\/$/, '');
  const prefix = apiPrefix.replace(/\/$/, '');
  return `${base}${prefix}${path}`;
}

function requestWeb({ path, method, data, header }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: buildUrl(path),
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...header,
      },
      timeout: requestTimeout,
      success(res) {
        const statusCode = res.statusCode || 500;
        if (statusCode >= 200 && statusCode < 300) {
          resolve(normalizeResponse(res.data));
          return;
        }
        reject(new Error((res.data && (res.data.message || res.data.error)) || `request_failed_${statusCode}`));
      },
      fail: reject,
    });
  });
}

function requestUpload(filePath, formData = {}) {
  const endpoint = ENDPOINTS.uploadMedia;
  if (getBackendProvider() !== 'web' || !endpoint.path) {
    const ext = String(filePath).split('.').pop() || 'jpg';
    return uploadToCloud({
      cloudPath: `walks/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`,
      filePath,
    }).then((response) => response.fileID);
  }

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: buildUrl(endpoint.path),
      filePath,
      name: 'file',
      formData,
      timeout: requestTimeout,
      success(res) {
        let payload = {};
        try {
          payload = JSON.parse(res.data);
        } catch (error) {
          reject(new Error('upload_response_invalid'));
          return;
        }
        const normalized = normalizeResponse(payload);
        resolve(normalized.url || normalized.fileUrl || normalized.fileID || normalized.path);
      },
      fail: reject,
    });
  });
}

function callApi(name, data = {}) {
  const endpoint = ENDPOINTS[name];
  if (!endpoint) {
    return Promise.reject(new Error(`unknown_endpoint_${name}`));
  }

  if (getBackendProvider() !== 'web' || !endpoint.path || endpoint.method === 'UPLOAD') {
    return callCloud(endpoint.cloudName || name, data);
  }

  if (endpoint.method === 'GET') {
    return requestWeb({ path: endpoint.path, method: endpoint.method, data });
  }

  return requestWeb({ path: endpoint.path, method: endpoint.method, data });
}

module.exports = {
  callApi,
  getBackendProvider,
  requestUpload,
};

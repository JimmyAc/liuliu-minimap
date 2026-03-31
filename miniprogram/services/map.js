const { callApi, getBackendProvider } = require('./api');
const { getInputTips } = require('../utils/amap');

function searchLocations(query, location = null) {
  if (getBackendProvider() === 'web') {
    return callApi('searchLocations', { query });
  }

  return getInputTips({ keyword: query, location });
}

function fetchNearbyPois(lat, lng) {
  if (getBackendProvider() !== 'web') {
    return Promise.resolve([]);
  }
  return callApi('fetchNearbyPois', { lat, lng });
}

module.exports = {
  fetchNearbyPois,
  searchLocations,
};

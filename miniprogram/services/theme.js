const { callCloud } = require('./cloud');

function generateTheme(payload) {
  return callCloud('generateTheme', payload);
}

function generateRandomTheme(payload) {
  return callCloud('generateRandomTheme', payload);
}

function generateCombinedTheme(payload) {
  return callCloud('generateCombinedTheme', payload);
}

function getLocationContext(payload) {
  return callCloud('getLocationContext', payload);
}

function verifyMission(payload) {
  return callCloud('verifyMission', payload);
}

module.exports = {
  generateCombinedTheme,
  generateRandomTheme,
  generateTheme,
  getLocationContext,
  verifyMission,
};

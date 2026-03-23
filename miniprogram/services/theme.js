const { callCloud } = require('./cloud');

function generateTheme(payload) {
  return callCloud('generateTheme', payload);
}

function getLocationContext(payload) {
  return callCloud('getLocationContext', payload);
}

module.exports = {
  generateTheme,
  getLocationContext,
};

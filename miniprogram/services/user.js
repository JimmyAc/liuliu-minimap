const { callApi } = require('./api');

function syncUser(profile = {}) {
  return callApi('syncUser', { profile });
}

module.exports = {
  syncUser,
};

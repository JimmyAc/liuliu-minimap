const { callCloud } = require('./cloud');

function syncUser(profile = {}) {
  return callCloud('syncUser', { profile });
}

module.exports = {
  syncUser,
};

const { callCloud } = require('./cloud');

function createWalk(payload) {
  return callCloud('createWalk', payload);
}

function listMyWalks(payload = {}) {
  return callCloud('listMyWalks', payload);
}

function listPublicWalks(payload = {}) {
  return callCloud('listPublicWalks', payload);
}

module.exports = {
  createWalk,
  listMyWalks,
  listPublicWalks,
};

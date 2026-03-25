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

function getWalkDetail(payload = {}) {
  return callCloud('getWalkDetail', payload);
}

module.exports = {
  createWalk,
  getWalkDetail,
  listMyWalks,
  listPublicWalks,
};

Component({
  data: {
    missionCards: [],
  },

  properties: {
    activeMission: {
      type: String,
      value: '',
    },
    missions: {
      type: Array,
      value: [],
    },
    completedMissions: {
      type: Array,
      value: [],
    },
    missionReviews: {
      type: Object,
      value: {},
    },
  },

  observers: {
    'missions, activeMission, completedMissions, missionReviews': function updateMissionCards(missions, activeMission, completedMissions, missionReviews) {
      const completedSet = new Set(completedMissions || []);
      const cards = (missions || []).map((mission) => ({
        mission,
        active: activeMission === mission,
        completed: completedSet.has(mission),
        review: missionReviews && missionReviews[mission] ? missionReviews[mission] : null,
      }));
      this.setData({ missionCards: cards });
    },
  },

  methods: {
    selectMission(event) {
      const mission = event.currentTarget.dataset.mission;
      this.triggerEvent('select', { mission });
    },

    toggleMission(event) {
      const mission = event.currentTarget.dataset.mission;
      this.triggerEvent('toggle', { mission });
    },

    verifyMission(event) {
      const mission = event.currentTarget.dataset.mission;
      this.triggerEvent('verify', { mission });
    },
  },
});

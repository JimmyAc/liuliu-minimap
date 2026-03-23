Component({
  properties: {
    missions: {
      type: Array,
      value: [],
    },
    completedMissions: {
      type: Array,
      value: [],
    },
  },

  methods: {
    toggleMission(event) {
      const mission = event.currentTarget.dataset.mission;
      this.triggerEvent('toggle', { mission });
    },
  },
});

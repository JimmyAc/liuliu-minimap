Component({
  properties: {
    displaySummary: {
      type: String,
      value: '',
    },
    modeLabel: {
      type: String,
      value: '纯粹模式',
    },
    theme: {
      type: Object,
      value: null,
    },
  },

  methods: {
    handleStart() {
      this.triggerEvent('start');
    },
  },
});

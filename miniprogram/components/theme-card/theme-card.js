Component({
  properties: {
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

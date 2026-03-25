const { formatDate } = require('../../utils/format');

Component({
  properties: {
    walk: {
      type: Object,
      value: null,
    },
  },

  methods: {
    openDetail() {
      this.triggerEvent('open', { id: this.properties.walk && this.properties.walk._id });
    },

    formatTime(value) {
      return formatDate(value);
    },
  },
});

const { formatDate } = require('../../utils/format');

Component({
  properties: {
    walk: {
      type: Object,
      value: null,
    },
  },

  methods: {
    formatTime(value) {
      return formatDate(value);
    },
  },
});

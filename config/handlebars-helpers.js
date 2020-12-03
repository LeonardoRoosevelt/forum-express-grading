const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
module.exports = {
  ifCond: function(a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
  dayjs: function(a) {
    dayjs.extend(relativeTime)
    return dayjs(a).fromNow()
  },
  ifUser: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    return options.inverse(this)
  }
}

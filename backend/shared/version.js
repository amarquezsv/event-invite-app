// Single source of truth: reads the version from the root package.json.
// Require this module instead of hardcoding version strings anywhere.
const { version } = require('../../package.json')

module.exports = { version }

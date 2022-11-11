/**
 * configuration file for jest
 */
const {Buffer} = require('buffer')
module.exports = {
    /**
     * coverage settings
     * @link https://jestjs.io/docs/configuration#collectcoverage-boolean
     */
    collectCoverage: true,
    coverageDirectory : 'tests/coverage-report',
    coverageReporters: ["clover", "json", "lcov","text-summary"],
    coveragePathIgnorePatterns : ["/node_modules/","i18n","migrations","Mocker.js"],
    
    globals : {
        Uint8Array : Uint8Array,
        Buffer : Buffer,
    },

    setupFiles: ["jest-canvas-mock"],
    preset: '@vue/cli-plugin-unit-jest',
    moduleNameMapper: {
        "\\.(css|less|scss|sss|styl)$": "jest-css-modules"
    },
}
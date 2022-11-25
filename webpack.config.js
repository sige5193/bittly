/**
 * webpack config file
 * @note this file was included by vue.config.js
 * @link https://webpack.js.org/configuration/
 */
module.exports = {
    /**
     * options that affect the behavior of webpack-dev-server
     * @link https://webpack.js.org/configuration/dev-server/#devserver
     */
    devServer: {
        onListening: function () {},
    },

    /**
     * Configure how performance hints are shown.
     * @link https://webpack.js.org/configuration/performance/
     */
    performance: {
        hints: 'warning',
        maxEntrypointSize: 100 * 1024 * 1024,
        maxAssetSize: 60 * 1024 * 1024,
        assetFilter: assetFilename => assetFilename.endsWith('.js'),
    }
};
/**
 * set configuration variables
 */
let publicPath = '/';
let pageTemplate = 'public/index.html';
if ( 'production' === process.env.NODE_ENV && 'browser' === process.env.BITTLY_HOST_TYPE ) {
    publicPath = process.env.BITTLY_WEBAPP_ASSETS_PATH;
    pageTemplate = 'public/index-webapp.html';
}

/**
 * configurations for vue cli
 * @link https://cli.vuejs.org/config/
 */
module.exports = {
    /**
     * The base URL your application bundle will be deployed at.
     * @property {String}
     * @link https://cli.vuejs.org/config/#publicpath
     */
    publicPath : publicPath,

    /**
     * webpack configurations
     * @property {Object}
     * @see {webpack.config.js}
     * @link https://cli.vuejs.org/config/#configurewebpack
     */
    configureWebpack: require('./webpack.config.js'),

    /**
     * css options
     */
    css: {
        extract : 'development' === process.env.NODE_ENV ? false : {
            ignoreOrder: true
        }
    },

    /**
     * build the app in multi-page mode
     * @property {Object}
     * @link https://cli.vuejs.org/config/#pages
     */
    pages: {
        index: {
            entry: 'src/main.js',
            template: pageTemplate,
            filename: 'index.html',
            title: 'Bittly',
            chunks: ['chunk-vendors', 'chunk-common', 'index']
        },
        toolTcpServer : {
          entry: 'src/tools/tcp-server/index.js',
          template: pageTemplate,
          filename: 'tool-tcp-server.html',
          title: 'TCP Server Tool',
          chunks: ['chunk-vendors', 'chunk-common', 'toolTcpServer']
        },
        toolUdpServer : {
            entry: 'src/tools/udp-server/index.js',
            template: pageTemplate,
            filename: 'tool-udp-server.html',
            title: 'UDP Server Tool',
            chunks: ['chunk-vendors', 'chunk-common', 'toolUdpServer']
        },
        toolTerminal : {
            entry: 'src/tools/terminal/index.js',
            template: pageTemplate,
            filename: 'tool-terminal.html',
            title: 'Terminal',
            chunks: ['chunk-vendors', 'chunk-common', 'toolTerminal']
        },
        toolCalculator : {
            entry: 'src/tools/calculator/index.js',
            template: pageTemplate,
            filename: 'tool-calculator.html',
            title: 'Calculator',
            chunks: ['chunk-vendors', 'chunk-common', 'toolCalculator']
        },
        toolWebSocketServer : {
            entry: 'src/tools/ws-server/index.js',
            template: pageTemplate,
            filename: 'tool-ws-server.html',
            title: 'Web Socket Server',
            chunks: ['chunk-vendors', 'chunk-common', 'toolWebSocketServer']
        },
        toolSerialPortServer : {
            entry: 'src/tools/serialport-server/index.js',
            template: pageTemplate,
            filename: 'tool-serialport-server.html',
            title: 'SerialPort Server',
            chunks: ['chunk-vendors', 'chunk-common', 'toolSerialPortServer']
        },
    },

    pluginOptions: {
        /**
         * configurations for electron builder plugin
         * @link https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/configuration.html
         */
        electronBuilder: {
            externals: ['serialport','bluetooth-serial-port'],
            preload: 'src/preload.js',
            
            /**
             * electron-builder options
             * @link https://www.electron.build/configuration/configuration
             */
            builderOptions : {
                npmRebuild : false,
                win : {
                    target : ['nsis','zip'],
                    icon : "build/icon.ico",
                },
                linux : {
                    target : ['AppImage'],
                    icon: "build/icon/",
                    category : "Development",
                },
                nsis: {
                    allowToChangeInstallationDirectory: true,
                    oneClick: false,
                    installerIcon : 'build/installer-icon.ico',
                    uninstallerIcon : 'build/uninstall-icon.ico',
                    createDesktopShortcut : true,
                    createStartMenuShortcut : true,
                    artifactName : "bittly-${version}-win-${arch}.exe",
                    menuCategory : 'Bittly',
                },
                appImage : {
                    artifactName : "bittly-${version}-${arch}.AppImage",
                },
                dmg: {
                    // artifactName : "bittly-${version}-${arch}.AppImage",
                    icon : "build/icon/Icon-512x512.png",
                },
                extraFiles : [
                    
                ],
                publish : [{
                    provider : "generic",
                    url : "http://127.0.0.1/update/",
                }],
            },
        },
    },
}

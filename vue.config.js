/**
 * configurations for vue cli
 * @link https://cli.vuejs.org/config/
 */
module.exports = {
    /**
     * webpack configurations
     * @property {Object}
     * @see {webpack.config.js}
     * @link https://cli.vuejs.org/config/#configurewebpack
     */
    configureWebpack: require('./webpack.config.js'),

    /**
     * build the app in multi-page mode
     * @property {Object}
     * @link https://cli.vuejs.org/config/#pages
     */
    pages: {
        index: {
            entry: 'src/main.js',
            template: 'public/index.html',
            filename: 'index.html',
            title: 'Bittly',
            chunks: ['chunk-vendors', 'chunk-common', 'index']
        },
        toolTcpServer : {
          entry: 'src/tools/tcp-server/index.js',
          template: 'public/index.html',
          filename: 'tool-tcp-server.html',
          title: 'TCP Server Tool',
          chunks: ['chunk-vendors', 'chunk-common', 'toolTcpServer']
        },
        toolUdpServer : {
            entry: 'src/tools/udp-server/index.js',
            template: 'public/index.html',
            filename: 'tool-udp-server.html',
            title: 'UDP Server Tool',
            chunks: ['chunk-vendors', 'chunk-common', 'toolUdpServer']
        },
        toolTerminal : {
            entry: 'src/tools/terminal/index.js',
            template: 'public/index.html',
            filename: 'tool-terminal.html',
            title: 'Terminal',
            chunks: ['chunk-vendors', 'chunk-common', 'toolTerminal']
        },
        toolCalculator : {
            entry: 'src/tools/calculator/index.js',
            template: 'public/index.html',
            filename: 'tool-calculator.html',
            title: 'Calculator',
            chunks: ['chunk-vendors', 'chunk-common', 'toolCalculator']
        },
        toolWebSocketServer : {
            entry: 'src/tools/ws-server/index.js',
            template: 'public/index.html',
            filename: 'tool-ws-server.html',
            title: 'Web Socket Server',
            chunks: ['chunk-vendors', 'chunk-common', 'toolWebSocketServer']
        },
        toolSerialPortServer : {
            entry: 'src/tools/serialport-server/index.js',
            template: 'public/index.html',
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
                    artifactName : "bittly-setup-${version}-win-amd64.exe",
                    menuCategory : 'Bittly',
                    include : "build/installer.nsh",
                },
                appImage : {
                    artifactName : "bittly-${version}-${arch}.AppImage",
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

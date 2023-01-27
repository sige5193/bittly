export default class EnvElectron {
    /**
     * @constructor
     */
    constructor() {
        this.name = 'electron';
        this.isDatabaseMigrationRequired = true;
        this.databaseStorageType = 'sqlite';
        this.isPluginsAvailable = true;
        this.serialportHandler = 'node-serialport';
        this.networkHandler = 'node';

        this.mode = 'prod';
        if ( 'development' === window.remote.process.env.NODE_ENV ) {
            this.mode = 'dev';
        }
    }

    /**
     * @param {*} type 
     * @param {*} name 
     * @param {*} handler 
     */
    on( type, name, handler ) {
        window[type].on(name, function () {
            let args = Array.from(arguments);
            handler(...args);
        });
    }

    /**
     * get language code for current env
     * @returns {String}
     */
    async langCodeGet() {
        let response = await window.ipcRenderer.invoke('main-controll-request', {
            action : 'system/locale-country-code-get',
            params : {},
        });
        return response;
    }

    /**
     * send log messages to host
     * @param {*} message 
     */
    log( message ) {
        window.ipcRenderer.send("app-log", message);
    }

    /**
     * get os info
     * @returns {Object}
     */
    getOS() {
        return window.os;
    }

    /**
     * open dev tools
     */
    openDevTools() {
        window.remote.getCurrentWebContents().openDevTools();
    }

    /**
     * Whether the window should always stay on top of other windows.
     * @param {Boolean} enable
     */
    setAlwaysOnTop( enable ) {
        window.remote.getCurrentWindow().setAlwaysOnTop(enable);
    }

    /**
     * open new window by given link
     * @param {*} link 
     */
    windowOpen( link ) {
        window.ipcRenderer.send("window-open", {uri:link});
    }

    /**
     * minize the window
     */
    windowMinimize() {
        window.remote.getCurrentWindow().minimize();
    }
    
    /**
     * maximize the window
     */
    windowMaximize() {
        let win = window.remote.getCurrentWindow();
        if ( win.isMaximized() ) {
            win.restore();
        } else {
            win.maximize();
        }
    }

    /**
     * open link by system browser
     * @param {*} link 
     */
    browserOpen(link) {
        window.shell.openExternal(link);
    }

    /**
     * @param  {...any} params 
     */
    ipcRendererSend ( ... params ) {
        window.ipcRenderer.send( ... params );
    }
}
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
}
export default class EnvBrowser {
    /**
     * @constructor
     */
    constructor() {
        this.name = 'browser';
        this.isDatabaseMigrationRequired = false;
        this.databaseStorageType = 'server';
        this.isPluginsAvailable = false;
        this.mode = 'localhost' == location.hostname ? 'dev' : 'prod';
        this.serialportHandler = 'web-serial';
    }

    /**
     * @param {*} type 
     * @param {*} name 
     * @param {*} handler 
     */
    on( type, name, handler ) {
        console.log(`environment event handler [${type}.${name}] ignored`);
    }

    /**
     * get language code for current env
     * @returns {String}
     */
    async langCodeGet() {
        return navigator.language;
    }

    /**
     * send log messages to host
     * @param {*} message 
     */
    log( message ) {
        // nothing to do here
    }

    /**
     * open dev tools
     */
    openDevTools() {
        this.errorActionNotSupported();
    }

    /**
     * Whether the window should always stay on top of other windows.
     * @param {Boolean} enable
     */
    setAlwaysOnTop( enable ) {
       this.errorActionNotSupported();
    }

    /**
     * show message that action not supported
     */
    errorActionNotSupported() {
        window.app.$error({
            title: window.app.$t('app.environmentNotSupportAction'),
            okText : window.app.$t('button.ok')
        });
    }

    /**
     * open new window by given link
     * @param {*} link 
     */
    windowOpen( link ) {
        window.open(link);
    }

    /**
     * open link by system browser
     * @param {*} link 
     */
    browserOpen(link) {
        window.open(link);
    }
}
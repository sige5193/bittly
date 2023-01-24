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
}
export default class PluginBase {
    /**
     * @param {*} options 
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * @param {*} path 
     * @returns 
     */
    getPath( path ) {
        if ( undefined === path ) {
            return this.options.basepath;
        } else {
            return `${this.options.basepath}/${path}`;
        }
    }

    /**
     * execute on installing plugin
     * @returns {void}
     */
    onInstall() {
        return Promise.resolve();
    }

    /**
     * execute on loading plugin
     * @returns {void}
     */
    onLoad() {
        return Promise.resolve();
    }

    /**
     * execute on uninstalling plugin
     * @returns {void}
     */
    onUninstall() {
        return Promise.resolve();
    }

    /**
     * add event handler to event
     * @param {String} eventName 
     * @param {Function} callback 
     */
    on( eventName, callback ) {
        window.app.$eventBus.$on(eventName, callback);
    }

    /**
     * open new window
     * @param {String} uri 
     * @param {Object} options 
     */
    winOpen( uri, options ) {
        options.uri = uri;
        window.ipcRenderer.send("window-open", options);
    }
}
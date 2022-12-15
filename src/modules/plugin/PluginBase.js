export default class PluginBase {
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
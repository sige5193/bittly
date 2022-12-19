import Common from '../../utils/Common.js'
import DirectiveResponseViewer from './base-handlers/DirectiveResponseViewer.js'
export default class PluginBase {
    /**
     * @param {*} options 
     */
    constructor(options) {
        this.options = options;
        this.loadedClasses = {};
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

    /**
     * @param {*} path 
     * @returns {Function}
     */
    loadClass(path) {
        if ( undefined != this.loadedClasses[path] ) {
            return this.loadedClasses[path];
        }

        let Bittly = {
            DirectiveResponseViewer
        };
        let filepath = this.getPath(`${path}.js`);
        let classContent = Common.fileGetContent(filepath).toString();
        let template = `return ${classContent};`;
        let loaderFunc = new Function('Bittly', template);
        let pluginClass = loaderFunc(Bittly);
        this.loadedClasses[path] = pluginClass;
        return pluginClass;
    }
}
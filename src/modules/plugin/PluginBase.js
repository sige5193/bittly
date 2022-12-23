import Common from '../../utils/Common.js'
import DirectiveResponseViewer from './base-handlers/DirectiveResponseViewer.js'
import DirectiveParameterEditor from './base-handlers/DirectiveParameterEditor.js';
import DirectiveParameterBuilder from './base-handlers/DirectiveParameterBuilder.js';
import DirectiveTargetEditor from './base-handlers/DirectiveTargetEditor.js';
import DirectiveCommunicator from './base-handlers/DirectiveCommunicator.js';
import PanelWidget from './base-handlers/PanelWidget.js';
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
            DirectiveResponseViewer,
            DirectiveParameterEditor,
            DirectiveParameterBuilder,
            DirectiveTargetEditor,
            DirectiveCommunicator,
            PanelWidget,
        };
        let filepath = this.getPath(`${path}.js`);
        let classContent = Common.fileGetContent(filepath).toString();
        let template = `return ${classContent};`;
        let loaderFunc = new Function('Bittly', template);
        let pluginClass = loaderFunc(Bittly);
        this.loadedClasses[path] = pluginClass;
        return pluginClass;
    }

    /**
     * load resource as base64 string
     * @param {*} path 
     */
    loadResource(path) {
        let filepath = this.getPath(path);
        let content = Common.fileGetContent(filepath).toString('base64');
        return content;
    }
}
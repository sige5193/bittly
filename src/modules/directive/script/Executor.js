import MdbProject from '../../../models/MdbProject.js';
import ScriptLib from './ScriptLib.js'
import ScriptRuntime from './ScriptRuntime.js';
import QuickCallLib from './QuickCallLib.js'
export default class Executor {
    /**
     * constructor of script executor
     * @param {MdbDirective} directive 
     */
    constructor( directive ) {
        /**
         * the directive model
         * @property {MdbDirective}
         */
        this.directive = directive;
        /**
         * the properties list to `$this`
         * @property {Object}
         */
        this.props = {};
        /**
         * the project to run with
         * @property {MdbProject|null}
         */
        this.project = null;
        /**
         * the script result object
         * @property {Object}
         */
        this.scriptResult = {};
    }

    /**
     * set property
     * @param {String} name 
     * @param {any} value 
     */
    setProp( name, value ) {
        this.props[name] = value;
    }

    /**
     * set project to executor
     * @param {MdbProject} project 
     */
    setProject( project ) {
        this.project = project;
    }

    /**
     * get the script result object
     * @returns {Object}
     */
    getResult() {
        return this.scriptResult;
    }

    /**
     * execute given script code
     * @param {String} script 
     * @returns {Object}
     */
    exec( script ) {
        let $this = new ScriptRuntime(this.directive);
        for ( let key in this.props ) {
            $this[key] = this.props[key];
        }
        let directiveData = this.directive.getData();
        for ( let key in directiveData ) {
            $this[key] = directiveData[key];
        }

        let bittly = new ScriptLib(this.directive);
        let project = this.getProjectScriptObject();
        
        try {
            let func = Function('$this', 'bittly', 'project', script);
            func.call({}, $this, bittly, project);
            this.scriptResult = $this.scriptResult;
        } catch ( e ) {
            throw Error(window.app.$t('directive.parameter.executeScriptFailed', [e.message]));
        }

        return this.scriptResult;
    }

    /**
     * execute function by given name and params
     * @param {String} funcName 
     * @param {any[]} params 
     * @returns {any}
     */
    execQuickCall(funcName, params) {
        let bittly = new QuickCallLib(this.directive);
        let project = this.getProjectScriptObject();
        
        let funcObj = bittly;
        let funcHandler = bittly[funcName];
        if ( undefined != project[funcName] ) {
            funcObj = project;
            funcHandler = project[funcName];
        }
        if ( undefined == funcHandler ) {
            throw Error(window.app.$t('directive.parameter.quickFunctionNameInvalid', [funcName]));
        }
        
        return funcHandler.apply(funcObj, params);
    }

    /**
     * get project script object
     * @returns {Object}
     */
    getProjectScriptObject() {
        let content = '';
        if ( null != this.project ) {
            content = this.project.script;
        }

        return Executor.getProjectScriptObjectByScriptContent(content);
    }

    /**
     * get project script object by given script content
     * @param {string} script 
     * @returns {Object}
     */
    static getProjectScriptObjectByScriptContent( script ) {
        try {
            let projectGenFunc = Function( `
                let project = {};
                ${script}
                return project;
            `);
            return projectGenFunc.call({});
        } catch ( e ) {
            throw Error(window.app.$t('directive.parameter.projectScriptObjectGenerateFailed', [e.message]));
        }
    }

    /**
     * get project script by current project
     * @returns {Object}
     */
    static async getProjectScriptObjectOfCurrentProject() {
        let projectId = window.app.$store.getters.projectActivedId;
        let project = await MdbProject.findOne(projectId);
        if ( null === project ) {
            return {};
        }
        return Executor.getProjectScriptObjectByScriptContent(project.script);
    }
}
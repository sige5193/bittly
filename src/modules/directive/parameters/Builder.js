import Common from '../../../utils/Common.js';
import encoding from 'encoding';
import MdbProject from '../../../models/MdbProject.js'
import TextBuildHandler from './text/BuildHandler.js';
import HexBuildHandler from './hex/BuildHandler.js';
import FormBuildHandler from './form/BuildHandler.js';
import FileBuildHandler from './file/BuildHandler.js'
import NoneBuilderHandler from './none/BuilderHandler.js'
import Executor from '../script/Executor.js';
/**
 * base class of parameters
 */
export default class Builder {
    /**
     * @property {Object|null}
     */
    static buildHandlers = null;

    /**
     * constructor of param builder
     * @param {MdbDirective} directive 
     */
    constructor( directive ) {
        /**
         * directive instance
         * @property {MdbDirective}
         */
        this.directive = directive;
        /**
         * format name of parameters
         * @property {String}
         */
        this.paramFormat = this.directive.requestFormat;
        /**
         * content of parameters
         * @property {String|Object}
         */
        this.paramContent = this.directive.requestContent[this.paramFormat];
        /**
         * placeholder for {{value}}
         * @property {String}
         */
        this.variable = null;
        /**
         * script result cached value
         * @property {Object}
         */
        this.scriptResult = null;
        /**
         * the project that directive belongs to.
         * @property {MdbProject}
         */
        this.project = null;
        /**
         * request buffer data
         * @property {Buffer}
         */
        this.requestBuffer = null;
        /**
         * build handler instance
         * @property {Object|null}
         */
        this.buildHandler = null;
    }

    /**
     * init the parameter builder
     */
    async init() {
        this.project = await MdbProject.findOne(this.directive.projectId);
        if ( null === this.project ) {
            throw Error('unable to find project on request param builder init.');
        }
    }

    /**
     * set variable {{value}}
     * @param {String} value 
     */
    setVariable( value ) {
        this.variable = value;
    }

    /**
     * set custom parameters, if format is null, this action would be ignored
     * @param {String|null} format
     * @param {String|Object|null} params 
     */
    setCustomParams( format, params ) {
        if ( null === format ) {
            return;
        }
        this.paramFormat = format;
        this.paramContent = params;
    }

    /**
     * convert string to real string, process '\' escape and CRLF
     * @param {String} str
     * @returns {String} 
     */
    convertStringToRealString( str ) {
        let real = JSON.stringify(str);
        real = real.replaceAll('\\\\', '\\');
        try {
            real = eval(real);
        } catch ( e ) {
            throw Error(window.app.$t('directive.parameter.parseStringFailed', [str, e.message]));
        }

        let nlstyle = this.directive.nlstyle;
        if ( null != nlstyle && 'DEFAULT' != nlstyle ) {
            real = real.replaceAll('\r\n', '\n');
            real = real.replaceAll('\r', '\n');
            if ( 'CRLF' == nlstyle ) {
                real = real.replaceAll('\n', '\r\n');
            } else if ( 'CR' == nlstyle ) {
                real = real.replaceAll('\n', '\r');
            }
        }

        return real;
    }

    /**
     * apply status placeholders to content
     * @param {*} content 
     * @returns 
     */
    applyStatusVariableToString( content ) {
        let newContent = content;
        let regex = /\{\{status\.(?<status>.*?)\}\}/gm;
        let match = null;
        
        while ((match = regex.exec(content)) !== null) {
            let statusName = match.groups.status;
            let statusValue = this.directive.statusGet(statusName);
            if ( undefined === statusValue ) {
                throw Error(window.app.$t('directive.parameter.statusNameNotExists',[statusName]));
            }
            newContent = newContent.replaceAll(match[0],statusValue);
        }

        return newContent;
    }

    /**
     * apply env variables to string
     * @param {String} content
     * @returns {String} 
     */
    applyEnvVariablesToString( content ) {
        let newContent = content;
        let regex = /\{\{env\.(?<env>.*?)\}\}/gm;
        let match = null;
        
        let envVariables = window.app.$store.getters.envVariables;
        while ((match = regex.exec(content)) !== null) {
            let envName = match.groups.env;
            let envValue = '';
            if ( undefined != envVariables[envName] ) {
                envValue = envVariables[envName].value;
            }

            newContent = newContent.replaceAll(match[0],envValue);
        }

        return newContent;
    }

    /**
     * apply variable `value` to string
     * @param {String} content 
     * @returns {String}
     */
    applyVariableValueToString( content ) {
        return content.replaceAll('{{value}}',this.variable);
    }

    /**
     * execute script
     * @param {Object}
     */
    executeRequestScript( options={} ) {
        if ( null != this.scriptResult ) {
            return this.scriptResult;
        }

        this.scriptResult = {};
        if ( 0 == this.directive.requestScript.trim().length ) {
            return {};
        }

        let executor = new Executor(this.directive);
        executor.setProp('parameter', options.parameter || null);
        executor.setProp('params', Common.objCopy(this.paramContent));
        executor.setProject(this.project);
        this.scriptResult = executor.exec(this.directive.requestScript);
        return this.scriptResult;
    }

    /**
     * get script result 
     * @returns {Object}
     */
    getScriptResult() {
        if ( null === this.scriptResult ) {
            throw Error("you can only get script result after process parameters.");
        }
        return this.scriptResult;
    }

    /**
     * apply script result to string, if variable does not exists
     * an empty string would be used.
     * @param {String} content 
     * @returns {String}
     */
    applyScriptResultToString( content ) {
        let newContent = content;
        let regex = /\{\{(?<variable>[a-zA-Z].*?)\}\}/gm;
        let match = null;
        while ((match = regex.exec(content)) !== null) {
            let varName = match.groups.variable;
            let varValue = '';
            if ( undefined != this.scriptResult[varName] ) {
                varValue = this.scriptResult[varName];
            }

            newContent = newContent.replaceAll(match[0], varValue);
        }

        return newContent;
    }

    /**
     * execute quick call function
     * @param {String} content
     * @param {String|Object} requestParams
     * @returns {String}
     */
    applyQuickCallToString( content, requestParams ) {
        let executor = new Executor(this.directive);
        executor.setProject(this.project);
        
        let newContent = content;
        let regex = /\{\{@(?<func>.*?)\((?<params>.*?)\)\}\}/gm;
        let match = null;
        while ((match = regex.exec(content)) !== null) {
            let funcName = match.groups.func;
            let params =  match.groups.params;
            if ( 0 == params.length ) {
                params = [];
            } else {
                params = params.split(',');
            }

            // build params array
            for ( let i=0; i<params.length; i++ ) {
                let paramItem = params[i].trim();
                if ( '$content' == paramItem ) {
                    params[i] = requestParams;
                } else if ( '$' === paramItem[0] ) {
                    let index = paramItem.substring(1) * 1 - 1;
                    if ( isNaN(index) ) {
                        throw Error(window.app.$t('directive.parameter.parameterIndexNotAvailable', [content, funcName, paramItem]));
                    }
                    if ( undefined === requestParams[index] ) {
                        throw Error(window.app.$t('directive.parameter.parameterIndexNotExists', [content, funcName, index+1]));
                    }
                    params[i] = requestParams[index];
                }
            }
            
            let value = executor.execQuickCall(funcName, params);
            newContent = newContent.replaceAll(match[0], value);
        }

        return newContent;
    }

    /**
     * convert string to given charset
     * @param {String} content
     * @returns {String}
     */
    convertStringCharset( content, charset ) {
        if ( 0 == charset.trim().length || 'utf-8' === charset ) {
            return content;
        }
        let result = encoding.convert(content, charset, 'utf-8');
        return result;
    }

    /**
     * get build handler instance
     * @returns {Object}
     */
    getBuildHandler() {
        if ( null === Builder.buildHandlers ) {
            Builder.buildHandlers = {};
            Builder.buildHandlers.text = TextBuildHandler;
            Builder.buildHandlers.hex = HexBuildHandler;
            Builder.buildHandlers.form = FormBuildHandler;
            Builder.buildHandlers.file = FileBuildHandler;
            Builder.buildHandlers.none = NoneBuilderHandler;
            window.app.$eventBus.$emit('app-directive-parameter-build-handler-list-init', this);
        }

        if ( null == this.buildHandler ) {
            if ( undefined === Builder.buildHandlers[this.paramFormat] ) {
                throw Error(window.app.$t('directive.parameter.buildHandlerNotAvailable', [this.paramFormat]));
            }
            let handler = Builder.buildHandlers[this.paramFormat];
            this.buildHandler = new handler(this);
        }
        return this.buildHandler;
    }

    /**
     * @param {*} name 
     * @param {*} handlerClass 
     */
    registerBuildHandler( name, handlerClass ) {
        Builder.buildHandlers[name] = handlerClass;
    }

    /**
     * generate request buffer data
     * @returns {Buffer}
     */
    getRequestBuffer() {
        if ( null != this.requestBuffer ) {
            return this.requestBuffer;
        }
        let builder = this.getBuildHandler();
        this.requestBuffer = builder.buildBuffer();
        return this.requestBuffer;
    }
    
    /**
     * get request data
     * @returns {Object}
     */
    getRequestData() {
        return this.getRequestBuffer();
    }

    /**
     * 
     */
     toJSON() {
        return null;
    }
}
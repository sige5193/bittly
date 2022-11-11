import MdbDirective from "../../../models/MdbDirective";
import Common from "../../../utils/Common";
import DirectiveExecutor from '../../directive/Executor.js'
export default class WidgetActionScriptBittly {
    /**
     * constructor of script object
     */
    constructor(options) {
        this.runtime = options.runtime;
        this.projectId = options.projectId;
        this.widget = options.widget;
        this.component = options.component;
    }
    
    /**
     * delay given ms
     * @param {Number} time 
     */
    async msleep( time ) {
        await Common.msleep(time);
    }

    /**
     * set runtime variable value
     * @param {Name} name 
     * @param {any} value 
     */
    variableSet(name, value) {
        this.runtime.setVariableValue(name, value);
    }

    /**
     * get runtime variable value
     * @param {String} varName
     * @param {any} defaultValue 
     * @returns {any}
     */
    variableGet(varName, defaultValue) {
        return this.runtime.getVariableValue( varName, defaultValue );
    }

    /**
     * execute directive with text parameters
     * @param {String} directiveName 
     * @param {String} params 
     * @param {CallableFunction} responseCallback 
     */
    async directiveExecText( directiveName, params, responseCallback ) {
        return await this.directiveExec(directiveName, 'text', params, responseCallback);
    }

    /**
     * execute directive with hex parameters
     * @param {String} directiveName 
     * @param {String} params 
     * @param {CallableFunction} responseCallback 
     */
    async directiveExecHex( directiveName, params, responseCallback ) {
        return await this.directiveExec(directiveName, 'hex', params, responseCallback);
    }

    /**
     * execute directive with form parameters
     * @param {String} directiveName 
     * @param {Array} params 
     * @param {CallableFunction} responseCallback 
     */
    async directiveExecForm( directiveName, params, responseCallback ) {
        return await this.directiveExec(directiveName, 'form', params, responseCallback);
    }

    /**
     * execute directive
     * @param {String} directiveName name or full path of directive
     * @param {String} format type of parameter, hex | string | form 
     * @param {String|Array} params content of parameters
     * - hex : AABBCC
     * - string : ABCDEFGHIJKLMN
     * - form : [0x00, "1234"]
     */
    async directiveExec( directiveName, format, params, responseCallback ) {
        let directive = null;

        // load directive from holders
        if ( undefined !== this.component.scriptDirectives[directiveName] ) {
            directive = this.component.scriptDirectives[directiveName];
        }

        // if unable to load directive from holders, then load it from database
        if ( null === directive ) {
            directive = await MdbDirective.findByPathName(this.projectId, directiveName);
        }
        
        // if we still can not find the directive, throw the error.
        if ( null == directive ) {
            throw window.app.$t('panel.runMode.actionScriptUnableToFindDirective', [directiveName]);
        } else {
            // or we hold the directive in widget component
            this.component.scriptDirectives[directiveName] = directive;
        }
        
        if ( undefined == format ) {
            format = directive.requestFormat;
        }
        if ( undefined == params ) {
            params = directive.requestContent[format];
        } 
        if ( 'form' == format ) {
            if ( !Array.isArray(params) ) {
                throw window.app.$t('panel.runMode.actionScriptFormParamDataTypeError');
            }

            if ( undefined == directive.requestContent.form ) {
                throw Error(window.app.$t('panel.runMode.directiveParameterFormatFormIsNotAvailable', [directive.name]));
            }

            let tmpParams = Common.objCopy(directive.requestContent[format]);
            if ( params.length != tmpParams.length ) {
                throw window.app.$t('panel.runMode.actionScriptFormParamNotMatch', [tmpParams.length, params.length]);
            }
            for ( let i=0; i<tmpParams.length; i++ ) {
                tmpParams[i].value = `${params[i]}`;
            }
            params = tmpParams;
        }

        let executor = new DirectiveExecutor(directive);
        executor.setCustomParams(format, params);
        
        let requestLog = {};
        requestLog.directive = directive.getData();
        requestLog.time = new Date();
        requestLog.responseData = null;
        requestLog.status = 'send';
        requestLog.widget = Common.objCopy(this.widget);
        requestLog.executor = executor;
        
        let $this = this;
        executor.onData(function() {
            requestLog.status = 'success';
            requestLog.responseData = executor.getResponseBuffer();
            if ( undefined != responseCallback ) {
                responseCallback(executor);
            }
            $this.runtime.refresh();
        });

        let expection = null;
        try {
            await executor.execute();
        } catch ( e ) {
            expection = e;
            requestLog.status = 'error';
            requestLog.error = e;
        }
        
        this.runtime.requestLogPush(requestLog);
        if ( null != expection ) {
            throw expection;
        }

        requestLog.requestData = executor.getRequestBuffer();
        return executor;
    }

    /**
     * convert response to buffer
     * @param {*} executor 
     * @returns {Buffer}
     */
    responseReadAsBytes( executor ) {
        return executor.getResponseAsBytes();
    }

    /**
     * convert response to text string
     * @param {*} executor 
     * @returns {String}
     */
    responseReadAsText( executor ) {
        return executor.getResponseAsString();
    }

    /**
     * convert response to form
     * @param {*} executor 
     * @returns {Object}
     */
    responseReadAsForm(executor) {
        return executor.getResponseAsForm();
    }
}
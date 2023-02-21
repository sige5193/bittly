import MdbDirective from '../../../models/MdbDirective.js'
import Common from '../../../utils/Common.js'
import DirectiveExecutor from '../../directive/Executor.js'
export default class TestcaseLibBittly {
    /**
     * constructor of lib
     * @param {Object} options 
     * - projectId {String} id of project
     */
    constructor( options ) {
        this.projectId = options.projectId;
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
     * @param {*} directiveName
     * @param {*} format 
     * @param {*} params
     * - hex : AABBCC
     * - string : ABCDEFGHIJKLMN
     * - form : [0x00, "1234"]
     */
     async execDirective( directiveName, format, params, responseCallback ) {
        let directive = await MdbDirective.findByPathName(this.projectId, directiveName);
        if ( null == directive ) {
            throw window.app.$t('panel.runMode.actionScriptUnableToFindDirective', [directiveName]);
        }
        
        if ( undefined == format ) {
            format = directive.requestFormat;
        }
        if ( undefined == params ) {
            params = directive.requestContent[format];
        } else if ( 'form' == format ) {
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
        executor.onData(function() {
            if ( undefined != responseCallback ) {
                responseCallback(executor);
            }
        });
        await executor.execute();
        return executor;
    }

    /**
     * convert response to buffer arrya
     * @param {*} executor 
     * @returns {String}
     */
    responseReadAsBytes( executor ) {
        return executor.getResponseAsBytes();
    }

    /**
     * convert response to string
     * @param {*} executor 
     * @returns {Object}
     */
    responseReadAsText( executor ) {
        return executor.getResponseAsString();
    }

    /**
     * convert response to form object
     * @param {*} executor 
     * @returns {Object}
     */
    responseReadAsForm(executor) {
        return executor.getResponseAsForm();
    }

    /**
     * delay by given msec
     * @param {Number} time 
     */
    async msleep( time ) {
        await Common.msleep(time);
    }

    /**
     * @param {*} message 
     */
    abort( message ) {
        throw Error(message);
    }
}
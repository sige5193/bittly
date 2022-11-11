import Common from '@/utils/Common.js'
import MdbDirective from '@/models/MdbDirective.js'
/**
 * base class for communicators
 * @author sige
 * @abstract
 */
export default class CommunicatorBase {
    /**
     * constructor of CommunicatorBase
     * @param {Object} options communicator options 
     */
    constructor( options ) {
        this.comkey = null;
        this.deviceType = null;
        this.options = Common.objCopy(options);
        this.dataSendSize = 0;
        this.dataReceiveSize = 0;
        this.eventHandlerOnData = null;
        this.timeDelayBeforeFirstWrite = 2000;
        this.directive = null;
    }
    /**
     * set directive instance to this comminicator
     * @param {MdbDirective} directive 
     */
    setDirective( directive ) {
        this.directive = directive;
    }

    /**
     * get if connection is opened
     * @abstract
     * @returns {boolean}
     */
    getIsOpen() {
        throw Error('must be implemented by subclass!');
    }

    /**
     * open communicator connection
     * @abstract
     * @returns {Promise}
     */
    open() {
        throw Error('must be implemented by subclass!');
    }

    /**
     * close connection
     * @abstract
     * @returns {Promise}
     */
    close() {
        throw Error('must be implemented by subclass!');
    }

    /**
     * write data to connection
     * @abstract
     * @param {Buffer} data
     * @returns {number} 
     */
    write( data ) {
        throw Error('must be implemented by subclass!');
    }

    /**
     * get device type name
     * @returns {string}
     */
    getDeviceType() {
        return this.deviceType;
    }

    /**
     * get param build handler, if communicator use default builder, 
     * null will be returned.
     * @param {MdbDirective} directive
     * @returns {null|Object}
     */
    getParamBuilder( directive ) {
        return null;
    }

    /**
     * replace env variable placeholders to real variable values. 
     * @param {String} content 
     * @returns {String} 
     */
    applyEnvPlaceholderVariables( content ) {
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
     * set on data handler
     * @param {CallableFunction} handler 
     */
    onData( handler ) {
        this.eventHandlerOnData = handler;
    }

    /**
     * get data size that been send
     * @returns {Number}
     */
    getDataSendSize() {
        return this.dataSendSize;
    }
    
    /**
     * get data size that been received
     * @returns {Number}
     */
    getDataReceiveSize() {
        return this.dataReceiveSize;
    }

    /**
     * output log message to console.
     * @param {*} messages 
     */
    log (... messages ) {
        if ( 'test' === window.envName ) {
            return;
        }
        messages.unshift(`[${this.deviceType}]`);
        console.log(... messages);
    }

    /**
     * handle data received
     */
    dataReceived( data ) {
        if ( data instanceof ArrayBuffer ) {
            this.dataReceiveSize += data.byteLength;
        } else {
            this.dataReceiveSize += data.length;
        }
        if ( null != this.eventHandlerOnData ) {
            this.eventHandlerOnData(data);
        }
    }

    /**
     * commit device info to store to mark device online
     */
    deviceOnline() {
        window.app.$store.commit('communicatorOnline', {key:this.comkey, com:this});
    }

    /**
     * mark device offline
     */
    deviceOffline() {
        window.app.$store.commit('communicatorOffline',this.comkey);
    }

    /**
     * translate message to local language
     * @param {String} key 
     * @param {Array|undefined} params 
     */
    $t(key, params) {
        return window.app.$t(`directive.communicator.${this.deviceType}.${key}`, params);
    }

    /**
     * check if value is empty or throw an exception by given message key.
     * @param {any} value 
     * @param {String} messageKey 
     */
    optionRequireCheck( value, messageKey ) {
        if ( Common.isEmpty(value) ) {
            throw Error(this.$t(messageKey));
        }
    }

    /**
     * show toast message
     * @param {String} msgKey 
     * @param {Array|undefined} msgParams 
     * @param {String|undefined} type 
     */
    toast(msgKey, msgParams,type) {
        if ( undefined === type  ) {
            type = 'warning';
        }
        window.app.$message[type](this.$t(msgKey, msgParams));
    }
}
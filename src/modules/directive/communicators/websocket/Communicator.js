import Common from '@/utils/Common.js';
import CommunicatorBase from '../CommunicatorBase.js'
/**
 * Communicator for web socket 
 * @author sige
 */
export default class Communicator extends CommunicatorBase {
    /**
     * websocket instances
     */
    static instances = {};

    /**
     * get communicator instance by given options, the connection instance will
     * be cached util connection closed, once the connection is closed, the cached
     * instance would be deleted.
     * @param {Object} options 
     * @returns {Communicator}
     */
    static async setup( options ) {
        let key = Communicator.generateComKeyFromOptions(options);
        if ( undefined == Communicator.instances[key] ) {
            Communicator.instances[key] = new Communicator(options);
        }
        let exector = Communicator.instances[key];
        return exector;
    }

    /**
     * Generate communcator key by given options
     * @param {Object} options 
     * @returns {string}
     */
    static generateComKeyFromOptions( options ) {
        return `WebSocket:${options.wsUrl}`;
    }

    /**
     * constructor of communcator
     * @param {Object} options
     */
    constructor(options) {
        super(options);
        
        // apply connect options
        this.options.wsUrl = this.applyEnvPlaceholderVariables(this.options.wsUrl);
        this.optionRequireCheck(this.options.wsUrl, 'addressCannotBeEmpty');

        /**
         * key of device type
         * @overide
         * @property {String}
         */
        this.deviceType = 'websocket';
        /**
         * microseconds befor send data after connected
         * @overide
         * @property {Number}
         */
        this.timeDelayBeforeFirstWrite = 100;
        /**
         * communicator key in communicator instance list.
         * @overide
         * @property {String}
         */
        this.comkey = Communicator.generateComKeyFromOptions(options);
        /**
         * indicate if websocket is connected
         * @property {Boolean}
         */
        this.isConnected = false;
        /**
         * websocket connection instance
         * @property {WebSocket}
         */
        this.connection = null;
    }

    /**
     * Get is communcator is opened
     * @returns {Boolean}
     */
    getIsOpen() {
        return this.isConnected;
    }

    /**
     * open connection to websocket server
     * @returns {Promise}
     */
    open() {
        let url = this.options.wsUrl;
        let protocols = this.options.wsProtocols || [];
        if ( 0 == protocols.length ) {
            protocols = undefined;
        }

        let options = {};
        options.headers = {};
        let headerList = this.options.wsHeaders || [];
        for ( let i=0; i<headerList.length; i++ ) {
            let header = headerList[i];
            if ( 0 == header.name.trim().length ) {
                continue;
            }
            options.headers[header.name.trim()] = header.value;
        }
        if ( 0 == Object.keys(options.headers).length ) {
            delete options.headers;
        }
        if ( 0 == Object.keys(options).length ) {
            options = undefined;
        }

        let $this = this;
        return new Promise(function( resolve, reject ) {
            $this.connection = new window.ws.WebSocket(url, protocols, options);
            $this.connection.binaryType = 'arraybuffer';
            $this.connection.onopen = ( event ) => $this.handleOnOpen(event, resolve) ;
            $this.connection.onmessage = ( event ) => $this.handleOnData(event);
            $this.connection.onclose = ( event ) => $this.handleOnClose(event);
            $this.connection.onerror = () => $this.handleOpenOnError(reject);
        });
    }

    /**
     * handle event on websocket connection opened.
     * @param {Event} event
     * @param {CallableFunction} resolve
     */
    handleOnOpen( event, resolve ) {
        this.isConnected = true;
        this.deviceOnline();
        this.log('open', event);
        
        // update error handler after connected, so that we can
        // call error handler without reject.
        this.connection.onerror = ( event ) => this.handleOnError(event);
        resolve();
    }

    /**
     * handle event on connection has data come in
     * @param {Event} event 
     */
    handleOnData(event) {
        this.log('receive', event);
        let data = event.data;
        this.dataReceived(data);
    }

    /**
     * handle close event, this event may caused by user or network.
     * @param {Event} event 
     */
    handleOnClose( event ) {
        if ( false === this.isConnected ) {
            return;
        }

        this.log('close', event);
        window.app.$message.warning(this.$t('disconnected',[this.options.wsUrl]));
        this.deviceOffline()
        this.isConnected = false;
        delete Communicator.instances[this.comkey];
    }

    /**
     * handle error event duration the connection. once the error occured,
     * this connection would be closed.
     * @param {Event} event 
     */
    handleOnError(event) {
        this.log('error', event);
        this.handleOnClose();
    }
    
    /** 
     * handle error event on openning.
     * @param {CallableFunction} reject 
     */
    handleOpenOnError( reject ) {
        reject(this.$t('connectFailed',[this.options.wsUrl]));
    }

    /**
     * write data to websocket connection
     * @param {*} data 
     */
    write( data ) {
        let $this = this;
        return new Promise(( resolve ) => {
            $this.log('write', data);
            this.dataSendSize += data.length;
            $this.connection.send(data);
            resolve();
        });
    }

    /**
     * close the websocket connection
     */
    close() {
        let $this = this;
        return new Promise(( resolve ) => {
            $this.connection.close();
            resolve();
        });
    }
}
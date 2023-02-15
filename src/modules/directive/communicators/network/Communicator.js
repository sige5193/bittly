import Common from "@/utils/Common";
import CommunicatorBase from '../CommunicatorBase.js'
import NetHandlerTCP from "./NetHandlerTCP.js";
import NetHandlerUDP from "./NetHandlerUDP.js";
/**
 * communicator for network
 * @author sige
 */
export default class Communicator extends CommunicatorBase {
    /**
     * network instances
     */
    static instances = {};

    /**
     * get network instance by options
     * @param {*} options 
     * @returns 
     */
    static async setup( options ) {
        let key = Communicator.generateKeyFromOptions(options);
        if ( undefined == Communicator.instances[key] ) {
            Communicator.instances[key] = new Communicator(options);
        }
        let exector = Communicator.instances[key];
        return exector;
    }

    /**
     * Generate device key by given options
     * @param {*} options 
     */
     static generateKeyFromOptions( options ) {
        if ( 'TCP' == options.protocol ) {
            return NetHandlerTCP.generateKeyFromOptions(options);
        } else if ( 'UDP' === options.protocol ) {
            return NetHandlerUDP.generateKeyFromOptions(options);
        } else {
            throw Error(`net protocol "${options.protocol}" is not supported.`);
        }
    }

    /**
     * constructor of exector
     * @param {Object} options
     * - onData : callback function
     */
    constructor(options) {
        super(options);
        this.deviceType = 'network';
        if ( Common.isEmpty(this.options.protocol) ) {
            throw Error(this.$t('protocolCannotBeEmpty'));
        }
        if ( Common.isEmpty(this.options.host) ) {
            throw Error(this.$t('hostCannotBeEmpty'));
        }
        if ( Common.isEmpty(this.options.port) ) {
            throw Error(this.$t('portCannotBeEmpty'));
        }

        this.timeDelayBeforeFirstWrite = 100;
        this.comkey = `Network:${options.protocol}:${options.host}:${options.port}`;
        this.options.host = this.applyEnvPlaceholderVariables(this.options.host);
        this.options.port = this.applyEnvPlaceholderVariables(this.options.port);
        this.title = `${options.protocol} ${options.host}:${options.port}`;

        if ( 'TCP' == this.options.protocol ) {
            this.handler = new NetHandlerTCP(this);
        } else if ( 'UDP' === this.options.protocol ) {
            this.handler = new NetHandlerUDP(this);
        } else {
            throw Error(`net protocol "${this.options.protocol}" is not supported.`);
        }
    }

    /**
     * Get if network connection opend.
     * @returns {Boolean}
     */
    getIsOpen() {
        return this.handler.getIsOpen();
    }

    /**
     * Open network connection
     * @returns {Promise}
     */
    async open() {
        await this.handler.open();
        this.deviceOnline();
    }

    /**
     * close the serial port
     * @returns {Promise}
     */
    async close() {
        await this.handler.close();
    }

    /**
     * write data to network
     * @param {*} data 
     * @returns {Promise}
     */
    async write( data ) {
        await this.handler.write(data);
        this.dataSendSize += data.length;
    }

    /**
     * handle disconnect event for net connection handler
     * @returns {void}
     */
    deviceDisconnected() {
        this.deviceOffline();
        delete Communicator.instances[this.comkey];
    }
}
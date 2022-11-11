import CommunicatorBase from '../CommunicatorBase.js';
import ClassicHandler from './ClassicHandler.js'
import BleHander from './BleHandler.js'
export default class Communicator extends CommunicatorBase {
    /**
     * serial port instances
     */
    static instances = {};

    /**
     * get communicator instance by given options
     * @param {Object} options 
     * @returns {Communicator} 
     */
    static async setup( options ) {
        let key = Communicator.generateComkeyByOptions(options);
        if ( undefined == Communicator.instances[key] ) {
            Communicator.instances[key] = new Communicator(options);
        }
        let exector = Communicator.instances[key];
        if ( exector.getIsClosing() ) {
            throw Error(exector.$t('disconnecting'));
        }
        return exector;
    }

    /**
     * generate comkey by given options
     * @param {*} options 
     * @returns {String}
     */
    static generateComkeyByOptions( options ) {
        let key = ['Bluetooth',options.btType];
        if ( 'ble' == options.btType ) {
            key.push(options.btBleId);
        } else if ( 'classic' == options.btType ) {
            key.push(options.btAddress);
        }
        return key.join(':');
    }

    /**
     * constructor of communicator
     */
    constructor (options) {
        super(options);
        this.deviceType = 'bluetooth';
        this.comkey = Communicator.generateComkeyByOptions(options);
        this.timeDelayBeforeFirstWrite = 500;

        this.handler = null;
        if ( 'classic' == this.options.btType ) {
            this.handler = new ClassicHandler(this);
        } else if ( 'ble'== this.options.btType ) {
            this.handler = new BleHander(this);
        }
    }

    /**
     * @returns {Boolean}
     */
    getIsClosing() {
        return this.handler.isClosing;
    }

    /**
     * Get if connection is opened
     * @returns {Boolean}
     */
    getIsOpen() {
        return this.handler.getIsOpen();
    }

    /**
     * Open connection
     * @returns {Promise}
     */
    open() {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            $this.handler.open().then(() => {
                $this.deviceOnline();
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * close the connection
     * @returns {Promise}
     */
    close() {
        return this.handler.close();
    }

    /**
     * write data to connection
     * @param {Buffer} data
     * @returns {Promise} 
     */
    write( data ) {
        return this.handler.write(data);
    }

    /**
     * bluetooth connection disconnected
     */
    handleOnClose() {
        this.toast('disconnected', [this.handler.getDeviceTitle()]);
        this.deviceOffline();
        delete Communicator.instances[this.comkey];
    }
}
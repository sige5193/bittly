import CommunicatorBase from '../CommunicatorBase.js';
import ClassicHandler from './ClassicHandler.js'
import Environment from '../../../../environments/Environment.js'
import BtHandlerWebBluetoothBle from './BtHandlerWebBluetoothBle.js';
import BtHandlerElectronBluetoothBle from './BtHandlerElectronBluetoothBle.js'
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
        this.isClosing = false;

        let env = Environment.getEnv();
        this.handler = null; 
        if ( 'classic' == this.options.btType ) {
            this.handler = new ClassicHandler(this);
        } else if ( 'ble'== this.options.btType && 'web-bluetooth-ble' === env.bluetoothBleHandler ) {
            this.handler = new BtHandlerWebBluetoothBle(this);
        } else if ( 'ble' === this.options.btType && 'electron-bluetooth-ble' === env.bluetoothBleHandler ) {
            this.handler = new BtHandlerElectronBluetoothBle(this);
        }
    }

    /**
     * @returns {Boolean}
     */
    getIsClosing() {
        return this.isClosing;
    }

    /**
     * Get if connection is opened
     * @returns {Boolean}
     */
    getIsOpen() {
        return this.handler.getIsOpen();
    }

    /**
     * Open bluetooth connection
     * @returns {Promise}
     */
    async open() {
        await this.handler.open();
        this.deviceOnline();
        Communicator.instances[this.comkey] = this;
    }

    /**
     * close the connection
     * @returns {Promise}
     */
    async close() {
        await this.handler.close();
    }

    /**
     * write data to connection
     * @param {Buffer} data
     * @returns {Promise} 
     */
    async write( data ) {
        await this.handler.write(data);
        this.dataSendSize += data.length;
    }

    /**
     * bluetooth connection disconnected
     */
    deviceDisconnected() {
        this.toast('disconnected', [this.handler.getDeviceTitle()]);
        this.deviceOffline();
        delete Communicator.instances[this.comkey];
    }
}
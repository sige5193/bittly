import Environment from '../../../../environments/Environment.js'
import CommunicatorBase from '../CommunicatorBase.js'
import SerialPortHandlerNodeSerialPort from './SerialPortHandlerNodeSerialPort.js';
import SerialPortHandlerWebSerial from "./SerialPortHandlerWebSerial.js";
/**
 * communicator for serial port communication
 * @author sige
 */
export default class Communicator extends CommunicatorBase {
    /**
     * serial port instances
     */
    static instances = {};

    /**
     * list all availabel serial ports
     * @returns {Array}
     */
    static async list() {
        let ports = await window.SerialPort.list();
        return ports;
    }

    /**
     * 通过配置获取设备
     * @param {Object} options 
     * @returns {Communicator} 
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
        let keys = ['SerialPort'];
        keys.push(options.path);
        keys.push(options.baudRate);
        keys.push(options.dataBits);
        keys.push(options.stopBits);
        keys.push(options.parity);
        return keys.join(':');
    }

    /**
     * constructor of exector
     * @param {Object} options
     */
    constructor(options) {
        super(options);
        this.deviceType = 'serialport';
        this.timeDelayBeforeFirstWrite = '2000';
        this.comkey = Communicator.generateKeyFromOptions(options);
        
        let handler = Environment.getEnv().serialportHandler;
        if ( 'node-serialport' === handler ) {
            this.serialport = new SerialPortHandlerNodeSerialPort(options, this);
        } else if ( 'web-serial' === handler ) {
            this.serialport = new SerialPortHandlerWebSerial(options, this);
        } else {
            throw Error(`serialport handler does not exists`);
        }
    }

    /**
     * Get if serial port is opened
     * @returns {Boolean} 
     */
    getIsOpen() {
        return this.serialport.isOpen;
    }

    /**
     * Open serial port connection
     * @returns {Promise<void>}
     */
    async open() {
        await this.serialport.open();
        this.deviceOnline();
    }

    /**
     * write data to serial port
     * @param {*} data 
     */
    async write( data ) {
        await this.serialport.write(data);
        this.dataSendSize += data.length;
    }

    /**
     * close the serial port
     */
    async close() {
        await this.serialport.close();
        this.deviceDisconnected();
    }

    /**
     * handle device disconnected evnet
     */
    deviceDisconnected() {
        this.deviceOffline();
        delete Communicator.instances[this.comkey];
    }
}
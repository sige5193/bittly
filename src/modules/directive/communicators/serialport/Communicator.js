import Common from "@/utils/Common";
import CommunicatorBase from '../CommunicatorBase.js'
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

        if ( Common.isEmpty(options.path) ) {
            throw new Error(this.$t('pathCannotBeEmpty'));
        }
        if ( Common.isEmpty(options.baudRate) ) {
            throw new Error(this.$t('baudRateCannotBeEmpty'));
        }

        this.serialPort = new window.SerialPort({
            path : this.applyEnvPlaceholderVariables(options.path),
            baudRate: parseInt(this.applyEnvPlaceholderVariables(options.baudRate)),
            dataBits: parseInt(this.applyEnvPlaceholderVariables(options.dataBits)),
            stopBits: parseInt(this.applyEnvPlaceholderVariables(options.stopBits)),
            parity: this.applyEnvPlaceholderVariables(options.parity),
            autoOpen: false,
        });
        
        this.serialPort.on('open', () => this.handleOnOpen());
        this.serialPort.on('data', (data) => this.handleOnData(data));
        this.serialPort.on('error',(err) => console.log('SERIAL PORT ON ERROR',err));
        this.serialPort.on('close',(err) => this.handleOnClose(err));
        this.serialPort.on('drain',(err) => console.log('SERIAL PORT ON DRAIN',err));
    }

    /**
     * Get if serial port is opened
     * @returns {Boolean} 
     */
    getIsOpen() {
        return this.serialPort.isOpen;
    }

    /**
     * Open serial port connection
     */
    open() {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            if ( $this.serialPort.isOpen ) {
                resolve();
                return ;
            }

            $this.serialPort.open(function (err) {
                if (err) {
                    reject($this.$t('unableToOpen', [$this.options.path, err.message]));
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * close the serial port
     */
    close() {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            $this.serialPort.close(function( error ) {
                if ( error ) {
                    reject($this.$t('unableToClose', [$this.options.path, error.message]));
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * write data to serial port
     * @param {*} data 
     */
    write( data ) {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            $this.serialPort.write(data, function(err) {
                if (err) {
                    reject($this.$t('unableToWrite', [$this.options.path, err.message]));
                } else {
                    $this.dataSendSize += data.length;
                    $this.log('write', data);
                    resolve();
                }
            });
        });
    }

    /**
     * handle event on serial port opened.
     */
    handleOnOpen() {
        this.deviceOnline();
    }

    /**
     * handle event on serial port has data come in
     * @param {*} data 
     */
    handleOnData(data) {
        this.log('receive',data);
        this.dataReceived(data);
    }

    /**
     * hanle event on serial port closed
     * @param {Error} err 
     */
    handleOnClose( err ) {
        if ( null != err && undefined != err.disconnected && true === err.disconnected ) {
            this.toast('disconnected',[this.options.path], 'warning');
        }
        this.log('close');
        this.deviceOffline();
        delete Communicator.instances[this.options.path];
    }
}
import Common from "../../../../utils/Common";
import MyObject from "../../../../utils/datatype/MyObject";
export default class SerialPortHandlerNodeSerialPort {
    /**
     * @constructor
     * @param {*} options 
     */
    constructor( options, com ) {
        /**
         * @property {Communicator}
         */
        this.com = com;
        /**
         * @property {Object}
         */
        this.options = MyObject.copy(options);
        /**
         * callback function to resolve open action.
         * @property {Function}
         */
        this.openResolveCallback = null;
        /**
         * @property {Boolean}
         */
        this.isClosing = false;
        /**
         * @property {SerialPort}
         */
        this.serialport = this.createConnection(options);
        this.serialport.on('open', () => this.handleOnOpen());
        this.serialport.on('data', (data) => this.handleOnData(data));
        this.serialport.on('error',(err) => this.handleOnError(err));
        this.serialport.on('close',(err) => this.handleOnClose(err));
        this.serialport.on('drain',(err) => console.log('SERIAL PORT ON DRAIN',err));
    }

    /**
     * create serailport connection
     * @param {Object} options 
     * @returns {SerialPort}
     */
    createConnection(options) {
        let openOptions = {};
        openOptions.path = this.com.applyEnvPlaceholderVariables(options.path);
        if ( Common.isEmpty(openOptions.path) ) {
            throw Error(this.com.$t('pathCannotBeEmpty'));
        }

        openOptions.baudRate = parseInt(this.com.applyEnvPlaceholderVariables(options.baudRate));
        if ( Common.isEmpty(openOptions.path) ) {
            throw Error(this.com.$t('baudRateCannotBeEmpty'));
        }

        openOptions.dataBits = parseInt(this.com.applyEnvPlaceholderVariables(options.dataBits));
        openOptions.stopBits = parseInt(this.com.applyEnvPlaceholderVariables(options.stopBits));
        openOptions.parity = this.com.applyEnvPlaceholderVariables(options.parity);
        openOptions.autoOpen = false;
        if ( options.flowControl ) {
            if ( 'software' === options.flowControl ) {
                openOptions.xon = true;
                openOptions.xoff = true;
            } else if ( 'hardware' === options.flowControl ) {
                openOptions.rtscts = true;
            }
        }
        return new window.SerialPort(openOptions);
    }

    /**
     * @returns {Boolean}
     */
    getIsOpen() {
        return this.serialport.isOpen;
    }

    /**
     * Open serial port connection
     * @link https://serialport.io/docs/api-stream#open-1
     * @returns {Promise}
     */
    open() {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            if ( $this.serialport.isOpen ) {
                return resolve();
            }
            
            $this.openResolveCallback = resolve;
            $this.serialport.open(err => {
                if (null != err) {
                    return reject($this.com.$t('unableToOpen', [$this.options.path, err.message]));
                }
            });
        });
    }

    /**
     * write data to serial port, if data is empty, it would resolve directly.
     * @link https://serialport.io/docs/api-stream#write
     * @link https://serialport.io/docs/api-stream#drain-1
     * @param {Uint8Array} data 
     * @returns {Promise}
     */
    write( data ) {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            if ( 0 === data.length || !$this.serialport.isOpen || $this.isClosing) {
                return resolve();
            }

            $this.serialport.write(data, err => {
                if (undefined !== err) {
                    return reject($this.com.$t('unableToWrite', [$this.options.path, err.message]));
                }
            });
            $this.serialport.drain(() => resolve());
        });
    }

    /**
     * close the serial port connection
     * @link https://serialport.io/docs/api-stream#close-1
     * @returns {Promise}
     */
    close() {
        let $this = this;
        $this.isClosing = true;
        return new Promise(( resolve, reject ) => {
            if ( !$this.serialport.isOpen ) {
                $this.isClosing = false;
                return resolve();
            }

            $this.serialport.close(error => {
                $this.isClosing = false;
                if ( null !== error ) {
                    return reject($this.com.$t('unableToClose', [$this.options.path, error.message]));
                }
                resolve();
            });
        });
    }

    /**
     * Event handler for serialport opened.
     * The open event happens when the port is opened and ready for writing.
     * @link https://serialport.io/docs/api-stream#open
     */
    handleOnOpen() {
        this.openResolveCallback();
    }

    /**
     * event handler on data received
     * @link https://serialport.io/docs/api-stream#data
     * @param {Buffer} data 
     */
    handleOnData(data) {
        this.com.dataReceived(data);
    }

    /**
     * hanle event on serial port closed
     * @link https://serialport.io/docs/api-stream#close
     * @param {Error|null} err 
     */
    handleOnClose( err ) {
        if ( null != err && undefined != err.disconnected && true === err.disconnected ) {
            this.com.toast('disconnected',[this.options.path], 'warning');
            this.com.deviceDisconnected();
        }
    }

    /**
     * event handler on there is an unhandled error
     * @link https://serialport.io/docs/api-stream#error
     * @param {Error} err 
     */
    handleOnError(err) {
        this.com.toast('deviceError',[this.options.path, err.message], 'error');
    }
}
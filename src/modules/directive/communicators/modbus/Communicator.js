import Common from "@/utils/Common";
import MyNumber from "../../../../utils/datatype/MyNumber.js";
import CommunicatorBase from '../CommunicatorBase.js'
/**
 * communicator for modbus
 * @author sige
 */
export default class Communicator extends CommunicatorBase {
    /**
     * modbus communicator instances
     * @var {Array}
     */
    static instances = {};

    /**
     * list all availabel serial ports
     * @returns {Array}
     */
    static async listSerialPorts() {
        let ports = await window.SerialPort.list();
        return ports;
    }

    /**
     * get communicator instance by given options
     * @param {Object} options 
     * @returns {Communicator}
     */
    static async setup( options ) {
        let key = Communicator.generateKeyFromOptions(options);
        if ( undefined == Communicator.instances[key] ) {
            Communicator.instances[key] = new Communicator(options);
        }
        let exector = Communicator.instances[key];
        exector.updateOptions(options);
        return exector;
    }

    /**
     * generate communicator key by given options
     * @returns {String}
     */
    static generateKeyFromOptions( options ) {
        let key = ['Modbus'];
        key.push(options.modbusMode);
        if ( 'RTU' == options.modbusMode || 'ASCII' == options.modbusMode ) {
            key.push(options.modbusSerialport);
            key.push(options.modbusBaudRate);
            key.push(options.modbusDataBits);
            key.push(options.modbusStopBits);
            key.push(options.modbusParity);
        } else if ( 'TCP-IP' === options.modbusMode ) {
            key.push(options.modbusHost);
            key.push(options.modbusPort);
        }
        return key.join(':');
    }

    /**
     * constructor of exector
     * @param {Object} options
     */
    constructor(options) {
        super(options);
        this.comkey = Communicator.generateKeyFromOptions(options);
        this.deviceType = 'modbus';
        this.timeDelayBeforeFirstWrite = 500;
        this.isConnected = false;
        
        this.options.modbusMode = this.applyEnvPlaceholderVariables(this.options.modbusMode);
        this.optionRequireCheck(this.options.modbusMode, 'modeCannotBeEmpty');

        if ( 'RTU' == this.options.modbusMode || 'ASCII' == this.options.modbusMode ) {
            this.initSerialportOptions();
        } else if ( 'TCP-IP' === options.modbusMode ) {
            this.initTcpOptions();
        }
        
        this.client = new window.modbus();
        this.client.on('error', (error) => this.handleOnError(error) );
        this.client.on('close', () => this.handleOnClose() );
        this.updateOptions(options);
    }
    
    /**
     * init serial port options for modbus-RTU or modbus-ASCII
     */
    initSerialportOptions() {
        this.options.modbusSerialport = this.applyEnvPlaceholderVariables(this.options.modbusSerialport);
        this.optionRequireCheck(this.options.modbusSerialport, 'serialportCannotBeEmpty');

        this.options.modbusBaudRate = parseInt(this.applyEnvPlaceholderVariables(this.options.modbusBaudRate));
        this.optionRequireCheck(this.options.modbusBaudRate, 'baudRateCannotBeEmpty');
        
        this.options.modbusDataBits = parseInt(this.applyEnvPlaceholderVariables(this.options.modbusDataBits));
        this.optionRequireCheck(this.options.modbusDataBits, 'dataBitsCannotBeEmpty');

        this.options.modbusStopBits = parseInt(this.applyEnvPlaceholderVariables(this.options.modbusStopBits));
        this.optionRequireCheck(this.options.modbusStopBits, 'stopBitsCannotBeEmpty');

        this.options.modbusParity = this.applyEnvPlaceholderVariables(this.options.modbusParity);
        this.optionRequireCheck(this.options.modbusParity, 'parityCannotBeEmpty');
    }

    /**
     * init tcp options
     */
    initTcpOptions() {
        this.options.modbusHost = this.applyEnvPlaceholderVariables(this.options.modbusHost);
        this.optionRequireCheck(this.options.modbusHost, 'hostCannotBeEmpty');

        let port = this.applyEnvPlaceholderVariables(this.options.modbusPort);
        this.optionRequireCheck(port, 'portCannotBeEmpty');
        this.options.modbusPort = parseInt(port);
    }

    /**
     * update options without close connection
     * @param {Object} options 
     */
    updateOptions( options ) {
        this.optionRequireCheck(options.modbusSlaveId, 'slaveIdCannotBeEmpty');
        this.options.modbusSlaveId = MyNumber.parseInteger(this.applyEnvPlaceholderVariables(options.modbusSlaveId));
        this.optionRequireCheck(this.options.modbusSlaveId, 'slaveIdCannotBeEmpty');

        this.optionRequireCheck(options.modbusFuncCode, 'functionCodeCannotBeEmpty');
        this.options.modbusFuncCode = this.applyEnvPlaceholderVariables(options.modbusFuncCode);
        this.optionRequireCheck(this.options.modbusFuncCode, 'functionCodeCannotBeEmpty');

        this.optionRequireCheck(options.modbusAddress, 'dataAddressCannotBeEmpty');
        this.options.modbusAddress = MyNumber.parseInteger(this.applyEnvPlaceholderVariables(options.modbusAddress));
        this.optionRequireCheck(this.options.modbusAddress, 'dataAddressCannotBeEmpty');
        
        let fcodesRequiresLength = ['01','02','03','04'];
        if ( -1 != fcodesRequiresLength.indexOf(this.options.modbusFuncCode) ) {
            this.optionRequireCheck(options.modbusLength, 'dataLengthCannotBeEmpty');
        }
        this.options.modbusLength = MyNumber.parseInteger(this.applyEnvPlaceholderVariables(options.modbusLength));
        if ( -1 != fcodesRequiresLength.indexOf(this.options.modbusFuncCode) ) {
            this.optionRequireCheck(this.options.modbusLength, 'dataLengthCannotBeEmpty');
        }

        this.options.modbusByteSwapEnable = options.modbusByteSwapEnable ? options.modbusByteSwapEnable : false;
    }

    /**
     * get if connection is connected
     * @returns {Boolean}
     */
    getIsOpen() {
        return this.isConnected;
    }

    /**
     * Open connection
     * @returns {Promise}
     */
    open() {
        let $this = this;
        return new Promise(function( resolve, reject ) {
            if ( 'RTU' == $this.options.modbusMode ) {
                let serialOptions = { 
                    baudRate: $this.options.modbusBaudRate,
                    dataBits: parseInt($this.options.modbusDataBits),
                    stopBits: parseInt($this.options.modbusStopBits),
                    parity: $this.options.modbusParity,
                };
                $this.client.connectRTUBuffered(
                    $this.options.modbusSerialport,
                    serialOptions,
                    (err) => $this.handleOnConnect(err, resolve, reject)
                );
            } else if ( 'ASCII' == $this.options.modbusMode ) {
                let serialOptions = { 
                    baudRate: $this.options.modbusBaudRate,
                    dataBits: parseInt($this.options.modbusDataBits),
                    stopBits: parseInt($this.options.modbusStopBits),
                    parity: $this.options.modbusParity,
                };
                $this.client.connectAsciiSerial(
                    $this.options.modbusSerialport,
                    serialOptions,
                    (err) => $this.handleOnConnect(err, resolve, reject)
                );
            } else if ( 'TCP-IP' === $this.options.modbusMode ) {
                $this.client.connectTCP(
                    $this.options.modbusHost, 
                    { port: $this.options.modbusPort }, 
                    (err) => $this.handleOnConnect(err, resolve, reject)
                );
            }
        });
    }

    /**
     * callback handler for connect
     * @param {Error} err
     * @param {CallableFunction} resolve
     * @param {CallableFunction} reject
     */
    handleOnConnect( err, resolve, reject ) {
        if ( null != err ) {
            reject(err);
            return;
        }

        this.log('connected');
        this.isConnected = true;
        this.deviceOnline();
        resolve();
    }

    /**
     * handle event on connection closed
     */
    handleOnClose() {
        if ( !this.isConnected ) {
            return;
        }

        let deivceName = null;
        if ( 'RTU' == this.options.modbusMode || 'ASCII' == this.options.modbusMode ) {
            deivceName = this.options.modbusSerialport;
        } else if ( 'TCP-IP' === this.options.modbusMode ) {
            deivceName = `${this.options.modbusHost}:${this.options.modbusPort}`;
        }

        this.toast('disconnected',[deivceName],'warning');
        this.log('closed');
        this.deviceOffline();
        this.isConnected = false;
        delete Communicator.instances[this.comkey];
    }

    /**
     * handle event on connection error
     * @param {*} error 
     */
    handleOnError( error ) {
        if ( 'ECONNREFUSED' === error.errno ) {
            this.handleOnClose();
        } else {
            throw error;
        }
    }

    /**
     * write data to serial port
     * @param {Buffer} data 
     */
    write( data ) {
        this.client.setID(this.options.modbusSlaveId);
        this.log('write', data);
        
        let actionMap = {
            '01' : 'writeFuncReadCoils',
            '02' : 'writeFuncReadDiscreteInputs',
            '03' : 'writeFuncReadHoldingRegisters',
            '04' : 'writeFuncReadInputRegisters',
            '05' : 'writeFuncWriteCoil',
            '06' : 'writeFuncWriteRegister',
            '15' : 'writeFuncWriteCoils',
            '16' : 'writeFuncWriteRegisters',
        };
        if ( undefined == actionMap[this.options.modbusFuncCode] ) {
            throw Error(this.$t('functionCodeNotSupport', [this.options.modbusFuncCode]))
        }
        let handler = actionMap[this.options.modbusFuncCode];

        let $this = this;
        return new Promise(( resolve, reject ) => {
            $this[handler](data, resolve, reject);
        });
    }

    /**
     * read coils
     * @param {Buffer} data 
     * @param {CallableFunction} resolve 
     * @param {CallableFunction} reject 
     */
    writeFuncReadCoils(data, resolve, reject) {
        this.client.readCoils(
            this.options.modbusAddress,
            this.options.modbusLength,
            (err,res) => this.handleOnResponse(resolve, reject, err, res)
        );
    }

    /**
     * read discrete input
     * @param {Buffer} data 
     * @param {CallableFunction} resolve 
     * @param {CallableFunction} reject 
     */
    writeFuncReadDiscreteInputs(data, resolve, reject) {
        this.client.readDiscreteInputs(
            this.options.modbusAddress,
            this.options.modbusLength,
            (err,res) => this.handleOnResponse(resolve, reject, err, res)
        );
    }

    /**
     * read holding registers
     * @param {Buffer} data 
     * @param {CallableFunction} resolve 
     * @param {CallableFunction} reject 
     */
    writeFuncReadHoldingRegisters(data, resolve, reject) {
        this.client.readHoldingRegisters(
            this.options.modbusAddress,
            this.options.modbusLength,
            (err,res) => this.handleOnResponse(resolve, reject, err, res)
        );
    }

    /**
     * read input registers
     * @param {Buffer} data 
     * @param {CallableFunction} resolve 
     * @param {CallableFunction} reject 
     */
    writeFuncReadInputRegisters(data, resolve, reject) {
        this.client.readInputRegisters(
            this.options.modbusAddress,
            this.options.modbusLength,
            (err,res) => this.handleOnResponse(resolve, reject, err, res)
        );
    }

    /**
     * write coil
     * @param {Buffer} data 
     * @param {CallableFunction} resolve 
     * @param {CallableFunction} reject 
     */
    writeFuncWriteCoil(data, resolve, reject) {
        if ( 0 == data.length ) {
            reject(this.$t('writeDataCannotBeEmpty'));
            return;
        }
        
        let addr = this.options.modbusAddress;
        this.client.writeCoil(
            addr,
            data[0],
            (err,res) => this.handleOnResponse(resolve, reject, err, res)
        );
    }

    /**
     * write register
     * @param {Buffer} data 
     * @param {CallableFunction} resolve 
     * @param {CallableFunction} reject 
     */
    writeFuncWriteRegister(data, resolve, reject) {
        if ( 0 == data.length ) {
            reject(this.$t('writeDataCannotBeEmpty'));
            return;
        }
        
        if ( this.options.modbusByteSwapEnable ) {
            data.swap16();
        }

        let value = window.nodeBuffer.from(data);
        let addr = this.options.modbusAddress;
        let callback = (err,res) => this.handleOnResponse(resolve, reject, err, res);
        this.client.writeRegister(addr,value, callback);
    }

    /**
     * write coils
     * @param {Buffer} data 
     * @param {CallableFunction} resolve 
     * @param {CallableFunction} reject 
     */
    writeFuncWriteCoils(data, resolve, reject) {
        if ( 0 == data.length ) {
            reject(this.$t('writeDataCannotBeEmpty'));
            return;
        }

        let values = [];
        for ( let i=0; i<data.length; i++ ) {
            let byte = data[i];
            let bin = [];
            for ( let bi=0; bi<8; bi++ ) {
                let bitValue = byte & 0x01;
                bin.unshift(bitValue);
                byte >>= 1;
            }
            values = values.concat(bin);
        }
        this.client.writeCoils(
            this.options.modbusAddress,
            values,
            (err,res) => this.handleOnResponse(resolve, reject, err, res)
        );
    }

    /**
     * write registers
     * @param {Buffer} data 
     * @param {CallableFunction} resolve 
     * @param {CallableFunction} reject 
     */
    writeFuncWriteRegisters(data, resolve, reject) {
        if ( 0 == data.length ) {
            reject(this.$t('writeDataCannotBeEmpty'));
            return;
        }
        
        if ( this.options.modbusByteSwapEnable ) {
            data.swap16();
        }

        let address = this.options.modbusAddress;
        let value = window.nodeBuffer.from(data);
        let callback = (err,res) => this.handleOnResponse(resolve, reject, err, res);
        this.client.writeRegisters(address,value,callback);
    }

    /**
     * process response data
     * @param {CallableFunction} resolve
     * @param {CallableFunction} reject
     * @param {Error} err
     * @param {Buffer} res
     */
    handleOnResponse( resolve, reject, err, res ) {
        if ( null != err ) {
            this.log(err);
            reject(err);
            return;
        }

        resolve();
        if ( undefined == res.buffer ) {
            return;
        }

        if ( this.options.modbusByteSwapEnable ) {
            res.buffer.swap16();
        }

        this.log('receive', res.buffer);
        this.dataReceiveSize += res.buffer.length;
        if ( null != this.eventHandlerOnData ) {
            this.eventHandlerOnData(res.buffer);
        }
    }

    /**
     * close the modbus connection
     * @returns {Promise}
     */
    close() {
        let $this = this;
        return new Promise(( resolve ) => {
            if ( 'TCP-IP' == $this.options.modbusMode ) {
                $this.client.close();
                $this.handleOnClose();
                resolve();
            } else {
                $this.client.close(() => {
                    resolve();
                });
            }
        });
    }
}
export default class ModbusMocker {
    /**
     * @property {Object}
     */
    static mock = {};

    /**
     * @param {*} options 
     */
    static setup() {
        let mock = {};
        mock.connectTCP = jest.fn(($this, host, opt, callback) => callback(null));
        mock.connectAsciiSerial = jest.fn(($this, port, opt, callback) => callback(null));
        mock.connectRTUBuffered = jest.fn(($this, port, opt, callback) => callback(null));
        mock.close = jest.fn(($this,callback) => {$this.eventHandlers.close(); callback();});
        mock.readCoils = jest.fn(($this, address,length,callback) => callback(null,{buffer:'HELLO'}));
        mock.readDiscreteInputs = jest.fn(($this, address,length,callback) => callback(null,{buffer:'HELLO'}));
        mock.readHoldingRegisters = jest.fn(($this, address,length,callback) => callback(null,{buffer:'HELLO'}));
        mock.readInputRegisters = jest.fn(($this, address,length,callback) => callback(null,{buffer:'HELLO'}));
        mock.writeCoil = jest.fn(($this, address,data,callback) => callback(null,{}));
        mock.writeRegister = jest.fn(($this, address,data,callback) => callback(null,{}));
        mock.writeCoils = jest.fn(($this, address,data,callback) => callback(null,{}));
        mock.writeRegisters = jest.fn(($this, address,data,callback) => callback(null,{}));
        ModbusMocker.mock = mock;
        window.modbus = ModbusMocker;
    }

    /**
     * 
     */
    constructor () {
        this.eventHandlers = {};
        this.slaveId = null;
    }

    /**
     * @param {*} name 
     * @param {*} callback 
     */
    on(name, callback) {
        this.eventHandlers[name] = callback;
    }

    /**
     * @param {*} id 
     */
    setID(id) {
        this.slaveId = id;
    }

    /**
     * @param {*} address 
     * @param {*} length 
     * @param {*} callback 
     */
    readCoils(address,length,callback) {
        ModbusMocker.mock.readCoils(this,address,length,callback);
    }

    /**
     * @param {*} address 
     * @param {*} length 
     * @param {*} callback 
     */
    readDiscreteInputs(address,length,callback) {
        ModbusMocker.mock.readDiscreteInputs(this,address,length,callback);
    }

    /**
     * @param {*} address 
     * @param {*} length 
     * @param {*} callback 
     */
    readHoldingRegisters(address,length,callback) {
        ModbusMocker.mock.readHoldingRegisters(this,address,length,callback);
    }

    /**
     * @param {*} address 
     * @param {*} length 
     * @param {*} callback 
     */
    readInputRegisters(address,length,callback) {
        ModbusMocker.mock.readInputRegisters(this,address,length,callback);
    }

    /**
     * @param {*} address 
     * @param {*} data 
     * @param {*} callback 
     */
    writeCoil(address,data,callback) {
        ModbusMocker.mock.writeCoil(this,address,data,callback);
    }

    /**
     * @param {*} address 
     * @param {*} data 
     * @param {*} callback 
     */
    writeRegister(address,data,callback) {
        ModbusMocker.mock.writeRegister(this,address,data,callback);
    }
    
    /**
     * @param {*} address 
     * @param {*} data 
     * @param {*} callback 
     */
    writeCoils(address,data,callback) {
        ModbusMocker.mock.writeCoils(this,address,data,callback);
    }

    /**
     * @param {*} address 
     * @param {*} data 
     * @param {*} callback 
     */
    writeRegisters(address,data,callback) {
        ModbusMocker.mock.writeRegisters(this,address,data,callback);
    }

    /**
     * @param {*} host 
     * @param {*} opt 
     * @param {*} callback 
     */
    connectTCP(host, opt, callback) {
        ModbusMocker.mock.connectTCP(this,host,opt,callback);
    }

    /**
     * @param {*} port 
     * @param {*} options 
     * @param {*} callback 
     */
    connectAsciiSerial(port,options,callback) {
        ModbusMocker.mock.connectAsciiSerial(this,port,options,callback);
    }

    /**
     * @param {*} port 
     * @param {*} options 
     * @param {*} callback 
     */
    connectRTUBuffered(port,options,callback) {
        ModbusMocker.mock.connectRTUBuffered(this,port,options,callback);
    }

    /**
     * @param {*} callback 
     */
    close( callback = ()=>{}) {
        ModbusMocker.mock.close(this,callback);
    }
}
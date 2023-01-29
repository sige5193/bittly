import crc from 'crc';
import MyString from "../../../../utils/datatype/MyString";
export default class MbHandlerWebSerial {
    /**
     * @property {Array<String>}
     */
    static modbusErrorMessages = [
        "Unknown error",
        "Illegal function (device does not support this read/write function)",
        "Illegal data address (register not supported by device)",
        "Illegal data value (value cannot be written to this register)",
        "Slave device failure (device reports internal error)",
        "Acknowledge (requested data will be available later)",
        "Slave device busy (retry request again later)"
    ];

    /**
     * @constructor
     */
    constructor() {
        /**
         * instance of web serial
         * @property {SerialPort}
         */
        this.port = null;
        /**
         * event handlers
         * @property {Object<String:Function>}
         */
        this.eventHandlers = {};
        /**
         * id of slave device
         * @property {Number}
         */
        this.slaveId = null;
        /**
         * the response reader
         * @property {ReadableStreamDefaultReader}
         */
        this.responseReader = null;
    }

    /**
     * set device slave id
     * @param {*} slaveId 
     */
    setID(slaveId) {
        this.slaveId = slaveId;
    }

    /**
     * register event handler
     * @param {*} eventName 
     * @param {*} callback 
     */
    on( eventName, callback ) {
        this.eventHandlers[eventName] = callback;
    }

    /**
     * get serialport instance by given device name
     * @param {String} name 
     * @returns {SerialPort|null}
     */
    async getSerialportByDevName( name ) {
        let ports = await navigator.serial.getPorts();
        for ( let i=0; i<ports.length; i++ ) {
            let port = ports[i];
            if ( port.devName === name ) {
                return port;
            }
        }

        return await this.requestDeviceManually(name);
    }

    /**
     * request new device manually
     * @param {String} name
     * @returns {Promse<SerialPort>}
     */
    requestDeviceManually(name) {
        return new Promise(resolve => {
            let requestOkHandler = async () => {
                let device = await navigator.serial.requestPort();
                if ( undefined === device.devName ) {
                    device.devName = name;
                    return resolve(device);
                }

                window.app.$confirm({
                    title: MyString.$t('directive.communicator.modbus.webSerialDeviceInuse',[device.devName, name]),
                    okText : MyString.$t('button.ok'),
                    cancelText : MyString.$t('button.cancel'),
                    onOk : () => resolve(device),
                    onCancel : () => resolve(null),
                });
            };

            window.app.$confirm({
                title: MyString.$t('directive.communicator.modbus.webSerialDeviceRequestManually',[name]),
                okText : MyString.$t('button.ok'),
                cancelText : MyString.$t('button.cancel'),
                onOk : requestOkHandler,
                onCancel : () => resolve(null),
            });
        });
    }

    /**
     * Connect to a communication port, using Bufferd Serial port.
     * @param {string} path the path to the Serial Port - required.
     * @param {Object} options - the serial port options - optional.
     * @param {Function} callback the function to call next.
     */
    async connectRTUBuffered(path, options, callback) {
        this.port = await this.getSerialportByDevName(path);
        if ( null === this.port ) {
            return callback(new Error(MyString.$t('directive.communicator.modbus.deviceNotAvailable')));
        }

        if ( undefined === this.port.modbusDisconnectCallback ) {
            this.port.removeEventListener('disconnect', this.port.modbusDisconnectCallback);
        }
        this.port.modbusDisconnectCallback = event => this.handleDisconnect(event);
        this.port.addEventListener('disconnect', this.port.modbusDisconnectCallback);
        
        await this.port.open({ 
            baudRate : parseInt(options.baudRate),
            dataBits : options.dataBits,
            flowControl : 'none',
            parity : options.parity,
            stopBits : parseInt(options.stopBits)
        });
        callback(null);
    }

    /**
     * event handler when the port has disconnected from the device. 
     * @param {Event} event 
     * @link https://developer.mozilla.org/en-US/docs/Web/API/SerialPort/disconnect_event
     */
    handleDisconnect( event ) {
        if ( undefined !== this.eventHandlers.close ) {
            this.eventHandlers.close();
        }
    }

    /**
     * close the connection
     * @param {Function} callback 
     */
    async close( callback ) {
        if ( null !== this.responseReader ) {
            await this.responseReader.cancel();
        }
        await this.port.close();
        if ( undefined !== this.eventHandlers.close ) {
            this.eventHandlers.close();
        }
        callback();
    }

    /**
     * write data to serialport
     * @param {Buffer} data 
     */
    async serialportWrite( data ) {
        if ( null === this.port ) {
            throw Error(this.$t('directive.communicator.modbus.deviceNotAvailable'));
        }

        let writer = this.port.writable.getWriter();
        await writer.write(data);
        writer.releaseLock();
    }

    /**
     * read data from serialport
     * @returns {Buffer}
     */
    async serialportRead( funcCode, expectLength ) {
        // read response
        let responseData = Buffer.alloc(0);
        this.responseReader = this.port.readable.getReader();
        debugger
        while ( responseData.length < expectLength ) {
            let response = await this.responseReader.read();
            if ( undefined === response.value ) {
                break ;
            }
            responseData = Buffer.concat([responseData, Buffer.from(response.value)]);
            
            // check expection
            if ( responseData.length >= 5 
            && responseData.readUInt8(1) === (0x80 | funcCode)) {
                this.responseReader.releaseLock();
                let errorCode = responseData.readUInt8(2);
                let errorMessage = MbHandlerWebSerial.modbusErrorMessages[errorCode];
                let message = ` Modbus exception [${errorCode}] : ${errorMessage || 'Unknown error'}`;
                throw Error(message);
            }
        }
        this.responseReader.releaseLock();
        this.responseReader = null;

        if ( responseData.length !== expectLength ) {
            let messageKey = 'directive.communicator.modbus.webSerialDeviceResponseLenNotMatch';
            let message = MyString.$t(messageKey, [expectLength, responseData.length]);
            throw Error(message);
        }

        // crc check
        let crcIn = responseData.readUInt16LE(responseData.length - 2);
        if (crcIn !== crc.crc16modbus(responseData.slice(0, -2))) {
            return callback(new Error('CRC ERROR'));
        }
        return responseData;
    }

    /**
     * write crc result to buffer
     * @param {Buffer} buffer 
     */
    bufferCRC( buffer ) {
        let crcData = buffer.slice(0, -2);
        let crcResult = crc.crc16modbus(crcData);
        buffer.writeUInt16LE(crcResult, buffer.length-2);
    }

    /**
     * setup request buffer data by given function code
     * @param {*} funcCode 
     * @returns {Buffer}
     */
    requestBufferSetup(funcCode, length) {
        let buf = Buffer.alloc(length);
        buf.writeUInt8(this.slaveId, 0);
        buf.writeUInt8(funcCode, 1);
        return buf;
    }

    /**
     * Write a Modbus "Preset Multiple Registers" (FC=16) to serial port.
     * @param {number} address the Data Address of the first register.
     * @param {Buffer} data the array of values to write to registers.
     * @param {Function} callback the function to call next.
     */
    async writeRegisters(address, data, callback) {
        let buf = this.requestBufferSetup(0x10, 7 + data.length + 2);
        buf.writeUInt16BE(address, 2); // start address
        buf.writeUInt16BE(data.length / 2, 4); // register count
        buf.writeUInt8(data.length, 6); // byte count
        data.copy(buf, 7); // write data
        this.bufferCRC(buf); // crc
        await this.serialportWrite(buf);

        let responseData = await this.serialportRead(0x0F, 8);
        callback(null, {buffer:responseData.slice(4, 6)});
    }
    /**
     * Write a Modbus "Force Multiple Coils" (FC=15) to serial port.
     * @param {number} address the Data Address of the first coil.
     * @param {Array} values the array of boolean states to write to coils.
     * @param {Function} callback the function to call next.
     */
    async writeCoils(address, values, callback) {
        let dataBytes = Math.ceil(values.length / 8);
        let buf = this.requestBufferSetup(0x0F, 7 + dataBytes + 2);
        buf.writeUInt16BE(address, 2);
        buf.writeUInt16BE(values.length, 4);
        buf.writeUInt8(dataBytes, 6);
        for ( let i=0; i<dataBytes; i++ ) {
            let byte = 0;
            for (let bi = 0; bi < 8; bi++) {
                byte <<= 1;
                byte |= values[i*8+bi];
            }
            buf.writeUInt8(byte, 7+i);
        }
        this.bufferCRC(buf); // crc
        await this.serialportWrite(buf);

        let responseData = await this.serialportRead(0x0F, 8);
        callback(null, {buffer:responseData.slice(4, 6)});
    }

    /**
     * Write a Modbus "Preset Single Register " (FC=6) to serial port.
     * @param {number} address the Data Address of the register.
     * @param {number} value the value to write to the register.
     * @param {Function} callback the function to call next.
     */
    async writeRegister(address, value, callback) {
        let buf = this.requestBufferSetup(0x06, 8);
        buf.writeUInt16BE(address, 2);
        value.copy(buf, 4);
        this.bufferCRC(buf); // crc
        await this.serialportWrite(buf);

        let responseData = await this.serialportRead(0x06, 8);
        callback(null, {buffer:responseData.slice(4, 6)});
    }

    /**
     * Write a Modbus "Force Single Coil" (FC=05) to serial port.
     * @param {number} address the Data Address of the coil.
     * @param {number} state the boolean state to write to the coil (true / false).
     * @param {Function} callback the function to call next.
     */
    async writeCoil(address, state, callback) {
        let buf = this.requestBufferSetup(0x05, 8);
        buf.writeUInt16BE(address, 2);
        buf.writeUInt16BE(state ? 0xff00 : 0x0000, 4);
        this.bufferCRC(buf); // crc
        await this.serialportWrite(buf);
        
        let responseData = await this.serialportRead(0x05, 8);
        callback(null, {buffer:responseData.slice(4, 6)});
    }

    /**
     * Write a Modbus "Read Input Registers" (FC=04) to serial port.
     * @param {number} address the Data Address of the first register.
     * @param {number} length the total number of registers requested.
     * @param {Function} callback the function to call next.
     */
    async readInputRegisters(address,length,callback) {
        let buf = this.requestBufferSetup(0x04, 8);
        buf.writeUInt16BE(address, 2);
        buf.writeUInt16BE(length, 4);
        this.bufferCRC(buf); // crc
        await this.serialportWrite(buf);
        
        let responseData = await this.serialportRead(0x04, 3 + length * 2 + 2);
        callback(null, {buffer:responseData.slice(3, 3 + length * 2)});
    }

    /**
     * Write a Modbus "Read Holding Registers" (FC=03) to serial port.
     * @param {number} address the Data Address of the first register.
     * @param {number} length the total number of registers requested.
     * @param {Function} callback the function to call next.
     */
    async readHoldingRegisters(address, length, callback) {
        try {
            let buf = this.requestBufferSetup(0x03, 8);
            buf.writeUInt16BE(address, 2);
            buf.writeUInt16BE(length, 4);
            this.bufferCRC(buf); // crc
            await this.serialportWrite(buf);

            let responseData = await this.serialportRead(0x03, 3 + length * 2 + 2);
            callback(null, {buffer:responseData.slice(3, 3 + length * 2)});
        } catch ( e ) {
            callback(e);
        }
    }

    /**
     * Write a Modbus "Read Input Status" (FC=02) to serial port.
     * @param {number} address the Data Address of the first digital input.
     * @param {number} length the total number of digital inputs requested.
     * @param {Function} callback the function to call next.
     */
    async readDiscreteInputs(address, length, callback) {
        let buf = this.requestBufferSetup(0x02, 8);
        buf.writeUInt16BE(address, 2);
        buf.writeUInt16BE(length, 4);
        this.bufferCRC(buf); // crc
        await this.serialportWrite(buf);

        let datalen = Math.ceil(length/8);
        let responseData = await this.serialportRead(0x02, 3 + datalen + 2);
        callback(null, {buffer:responseData.slice(3, 3 + datalen)});
    }

    /**
     * Write a Modbus "Read Coil Status" (FC=01) to serial port.
     * @param {number} address the Data Address of the first coil.
     * @param {number} length the total number of coils requested.
     * @param {Function} callback the function to call next.
     */
    async readCoils(address, length, callback) {
        let buf = this.requestBufferSetup(0x01, 8);
        buf.writeUInt16BE(address, 2);
        buf.writeUInt16BE(length, 4);
        this.bufferCRC(buf); // crc
        await this.serialportWrite(buf);

        let datalen = Math.ceil(length/8);
        let responseData = await this.serialportRead(0x01, 3 + datalen + 2);
        callback(null, {buffer:responseData.slice(3, 3 + datalen)});
    }
}
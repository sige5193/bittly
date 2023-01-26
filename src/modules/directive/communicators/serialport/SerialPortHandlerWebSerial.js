import Common from "../../../../utils/Common";
import MyObject from "../../../../utils/datatype/MyObject";
export default class SerialPortHandlerWebSerial {
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
         * @property {Boolean}
         */
        this.isOpen = false;
        /**
         * @property {SerialPort}
         */
        this.port = null;
        /**
         * @property {ReadableStreamDefaultReader}
         */
        this.reader = null;
    }

    /**
     * @returns {Boolean}
     */
    getIsOpen() {
        return this.isOpen;
    }

    /**
     * open serialport connection
     */
    async open() {
        let ports = await navigator.serial.getPorts();
        for ( let i=0; i<ports.length; i++ ) {
            let port = ports[i];
            if ( port.conId === this.options.path ) {
                this.port = port;
                break;
            }
        }
        
        if ( null === this.port ) {
            throw Error(this.com.$t('deviceNotAvailable'));
        }

        this.port.ondisconnect = event => this.handleDisconnect(event);
        await this.port.open({ 
            baudRate : parseInt(this.options.baudRate),
            // bufferSize : 4096,
            dataBits : this.options.dataBits,
            flowControl : 'none',
            parity : this.options.parity,
            stopBits : parseInt(this.options.stopBits)
        });
        this.isOpen = true;
        this.monitorReadStream();
    }
    
    /**
     * monitor read stream and trigger on data event on readable
     */
    async monitorReadStream() {
        console.log('serialport read stream monitor started');
        while (this.port.readable) {
            this.reader = this.port.readable.getReader();
            try {
                while (true) {
                    const { value, done } = await this.reader.read();
                    if (done) {
                        break;
                    }
                    this.com.dataReceived(value);
                    await Common.msleep(10);
                }
            } catch (error) {
                console.log('serialport read stream monitor error');
            } finally {
                this.reader.releaseLock();
            }
        }
        console.log('serialport read stream monitor stopped');
    }

    /**
     * write data to serialport
     * @param {*} data 
     */
    async write(data) {
        const writer = this.port.writable.getWriter();
        await writer.write(data);
        writer.releaseLock();
    }

    /**
     * close the serialport
     * @returns {Promise<void>}
     */
    async close() {
        this.isOpen = false;
        this.reader.releaseLock();
        await this.port.close();
    }

    /**
     * event handler when the port has disconnected from the device. 
     * @param {Event} event 
     * @link https://developer.mozilla.org/en-US/docs/Web/API/SerialPort/disconnect_event
     */
    handleDisconnect( event ) {
        this.com.toast('disconnected',[this.options.path], 'warning');
        this.isOpen = false;
        this.com.deviceDisconnected();
    }
}
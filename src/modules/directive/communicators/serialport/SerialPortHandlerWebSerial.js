import Common from "../../../../utils/Common";
export default class SerialPortHandlerWebSerial {
    /**
     * @constructor
     */
    constructor( com ) {
        /**
         * instance of host communicator
         * @property {Communicator}
         */
        this.com = com;
        /**
         * instance of serialport deivce
         * @property {SerialPort}
         */
        this.port = null;
    }

    /**
     * @returns {Boolean}
     */
    getIsOpen() {
        return this.port && this.port.isOpened;
    }

    /**
     * open serialport connection and add some properties to device object.
     * the list of properties added to the device :
     * - comSerialportClose : {Function} event handler on device 
     * - isOpened ： {Boolean}
     * - activeReader ： {ReadableStreamDefaultReader}
     * - devName : {String}
     */
    async open() {
        this.com.log(`[${this.com.options.path}] open`);
        this.port = await this.getSerialportByDevName(this.com.options.path);
        if ( null === this.port ) {
            throw Error(this.com.$t('deviceNotAvailable'));
        }

        this.port.comSerialportClose = () => this.handleDisconnect();
        this.port.addEventListener('disconnect', event => this.handleDisconnect(event));
        await this.port.open({
            baudRate : parseInt(this.com.options.baudRate),
            dataBits : this.com.options.dataBits,
            flowControl : 'none',
            parity : this.com.options.parity,
            stopBits : parseInt(this.com.options.stopBits)
        });
        this.port.isOpened = true;
        this.monitorReadStream();
        this.com.log(`[${this.com.options.path}] open => ok`);
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
                this.com.log(`[${this.com.options.path}] device is available`);
                return port;
            }
        }

        this.com.log(`[${this.com.options.path}] request new device`);
        let requestMessage = this.com.$t('webSerialDeviceRequestManually',[name]);
        let shouldGoRequest = await Common.confirm(requestMessage);
        if ( !shouldGoRequest ) {
            return null;
        }

        let device = null;
        try {
            device = await navigator.serial.requestPort();
        } catch {
            return null;
        }
        // device is free
        if ( undefined === device.devName ) {
            device.devName = name;
            return device;
        }

        // device is in use.
        this.com.log(`[${this.com.options.path}] device is inuse`);
        let switchMessage = this.com.$t('webSerialDeviceInuse',[device.devName, name]);
        let shouldSwitch = await Common.confirm(switchMessage);
        if ( !shouldSwitch ) {
            return null;
        }

        this.com.log(`[${this.com.options.path}] device switch to this`);
        if ( true === device.isOpened ) {
            if ( undefined != device.activeReader ) {
                await device.activeReader.cancel();
            }
            await device.close();
            await device.comSerialportClose();
        }

        device.devName = name;
        return device;
    }

    /**
     * monitor read stream and trigger on data event on readable
     */
    async monitorReadStream() {
        this.com.log(`[${this.com.options.path}] read stream monitor start`);
        let reader = this.port.readable.getReader();
        this.port.activeReader = reader;
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    this.com.log(`[${this.com.options.path}] read stream is done`);
                    break;
                }
                this.com.dataReceived(value);
                await Common.msleep(10);
            }
        } catch (error) {
            this.com.log(`[${this.com.options.path}] read stream error : ${error.message}`);
        } finally {
            reader.releaseLock();
            delete this.port.activeReader;
        }
        this.com.log(`[${this.com.options.path}] read stream monitor stopped`);
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
        this.port.isOpened = false;
        if ( undefined !== this.port.activeReader ) {
            await this.port.activeReader.cancel();
        }
        await this.port.close();
        this.com.log(`[${this.com.options.path}] closed`);
    }

    /**
     * event handler when the port has disconnected from the device. 
     * @note the `close` method would not trigger this event handler
     * @param {Event} event 
     * @link https://developer.mozilla.org/en-US/docs/Web/API/SerialPort/disconnect_event
     */
    handleDisconnect( event ) {
        this.port.isOpened = false;
        this.port = null;
        this.com.deviceDisconnected();
        this.com.toast('disconnected',[this.com.options.path], 'warning');
        this.com.log(`[${this.com.options.path}] disconnected`);
    }
}
import Common from "@/utils/Common";
import Validator from "../../../../utils/Validator";
import ElectronBleDeviceScanner from "./ElectronBleDeviceScanner";
import Communicator from "./Communicator";
/**
 * the bluetooth handler for ble device
 * @author sige
 */
export default class BtHandlerElectronBluetoothBle {
    /**
     * constructor of ble handler 
     * @param {Communicator} com 
     */
    constructor( com ) {
        /**
         * instance of host communicator
         * @property {Communicator}
         */
        this.com = com;
        /**
         * instance of bluetooth device
         * @property {BluetoothDevice}
         */
        this.device = null;
        /**
         * name of device
         * @property {String}
         */
        this.deviceName = null;
        /**
         * instance of characteristic
         * @property {BluetoothRemoteGATTCharacteristic}
         */
        this.characteristic = null;

        // check options
        let options = this.com.options;
        Validator.check(options.btBleId, 'NotEmpty', com.$t('bleDeviceIdCannotBeEmpty'));
        Validator.check(options.btBleServiceId,'NotEmpty',com.$t('bleServiceIdCannotBeEmpty'));
        Validator.check(options.btBleCharId,'NotEmpty',com.$t('btBleCharIdCannotBeEmpty'));
    }

    /**
     * check if connection is open
     * @returns {Boolean}
     */
    getIsOpen() {
        return null !== this.device && true === this.device.gatt.connected;
    }

    /**
     * get device title
     * @returns {String}
     */
    getDeviceTitle() {
        return this.deviceName;
    }

    /**
     * open connection
     * @returns {Promise}
     */
    async open() {
        if ( this.getIsOpen() ) {
            return ;
        }

        this.com.log('ble open');
        let scanner = ElectronBleDeviceScanner.getScanner();
        scanner.serviceId = this.com.options.btBleServiceId;
        let device = await scanner.requestDevice(this.com.options.btBleId);
        if ( null == device ) {
            throw Error(this.com.$t('unableToConnectToDevice', [this.com.options.btBleId]));
        }
        
        // add event listener on disconnected.
        if ( undefined !== device.disconnectedCallback ) {
            device.removeEventListener('gattserverdisconnected',device.disconnectedCallback);
        }
        device.disconnectedCallback = () => this.handleOnDisconnected();
        device.addEventListener('gattserverdisconnected',device.disconnectedCallback);
        
        // setup device name
        this.deviceName = device.name;
        if ( Common.isEmpty(this.deviceName) ) {
            this.deviceName = this.com.options.btBleId;
        }
        
        if ( !device.gatt.connected ) {
            await device.gatt.connect();
            this.com.log('ble gatt connected');
        }
        let services = await device.gatt.getPrimaryServices();
        let service = services[0];
        this.com.log(`ble service : ${service.uuid}`);
        let char = await service.getCharacteristic(this.com.options.btBleCharId);
        this.com.log(`ble characteristic : ${char.uuid}`);
        
        if ( char.properties.notify ) {
            this.com.log(`ble characteristic listening : ${char.uuid}`);
            await char.startNotifications();
            // add event listener on value change
            if ( undefined !== char.valueChangeCallback ) {
                char.removeEventListener('characteristicvaluechanged',char.valueChangeCallback);
            }
            char.valueChangeCallback = event => this.handleOnData(event);
            char.addEventListener('characteristicvaluechanged',char.valueChangeCallback);
        }
        
        this.device = device;
        this.characteristic = char;
    }

    /**
     * write data to characteristic
     * @param {Buffer} data 
     * @returns {Promise}
     */
    async write (data) {
        if ( 0 !== data.length ) {
            try {
                this.com.log(`ble characteristic write : `, data);
                await this.characteristic.writeValueWithoutResponse(data);
            } catch ( e ) {
                this.device.gatt.disconnect();
                throw Error(this.com.$t('writeFailed',[e.message]));
            }
        }
        
        // read value if needed
        if ( !this.characteristic.properties.notify && this.characteristic.properties.read ) {
            let $this = this;
            setTimeout(async () => {
                let value = await $this.characteristic.readValue();
                value = Buffer.from(value.buffer);
                $this.handleOnData({target:{value:{buffer:value}}});
            }, 10);
        }
    }

    /**
     * handler for data receiving.
     * @param {Event} event 
     */
    handleOnData(event) {
        let data = event.target.value;
        if ( ! (data instanceof Buffer) ) {
            data = Buffer.from(data.buffer);
        }
        this.com.dataReceived(data);
    }

    /**
     * event handler for gatt server disconnected
     */
    async handleOnDisconnected() {
        await Common.msleep(800);
        this.com.deviceDisconnected();
        this.com.log('ble disconnected');
    }

    /**
     * close the connection
     * @returns {Promise}
     */
    close() {
        this.com.log('ble close');
        this.device.gatt.disconnect();
        return Promise.resolve();
    }
}
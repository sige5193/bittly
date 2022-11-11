import Common from "@/utils/Common";
import BleDeviceScanner from "./BleDeviceScanner";
import Communicator from "./Communicator";
/**
 * the bluetooth handler for ble device
 * @author sige
 */
export default class BleHander {
    /**
     * constructor of ble handler 
     * @param {Communicator} com 
     */
    constructor( com ) {
        this.com = com;
        this.device = null;
        this.deviceName = null;
        this.characteristic = null;
        this.isConnected = false;
        this.isClosing = false;
        this.onGattServerDisconnected = () => this.handleOnDisconnected();
        this.characteristicvaluechanged = event => this.handleOnData(event);
        this.closeResolve = null;

        if ( Common.isEmpty(this.com.options.btBleId) ) {
            throw Error(com.$t('bleDeviceIdCannotBeEmpty'));
        }
        if ( Common.isEmpty(this.com.options.btBleServiceId) ) {
            throw Error(com.$t('bleServiceIdCannotBeEmpty'));
        }
        if ( Common.isEmpty(this.com.options.btBleCharId) ) {
            throw Error(com.$t('btBleCharIdCannotBeEmpty'))
        }
    }

    /**
     * check if connection is open
     * @returns {Boolean}
     */
    getIsOpen() {
        return this.isConnected;
    }

    /**
     * open connection
     * @returns {Promise}
     */
    async open() {
        if ( this.isConnected ) {
            return;
        }

        let scanner = BleDeviceScanner.getScanner();
        let device = scanner.getDevice(this.com.options.btBleId);
        if ( null === device ) {
            scanner.serviceId = this.com.options.btBleServiceId;
            device = await scanner.requestDevice(this.com.options.btBleId);
        }
        if ( null == device ) {
            throw Error(this.com.$t('unableToConnectToDevice', [this.com.options.btBleId]));
        }
        
        device.addEventListener('gattserverdisconnected',this.onGattServerDisconnected);
        this.deviceName = device.name;
        if ( Common.isEmpty(this.deviceName) ) {
            this.deviceName = this.com.options.btBleId;
        }

        if ( !device.gatt.connected ) {
            await device.gatt.connect();
        }
        let services = await device.gatt.getPrimaryServices();
        let service = services[0];
        let characteristic = await service.getCharacteristic(this.com.options.btBleCharId);
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', this.characteristicvaluechanged);
        this.device = device;
        this.characteristic = characteristic;
        this.isConnected = true;
        this.com.log('ble opend');
    }

    /**
     * write data to characteristic
     * @param {Buffer} data 
     * @returns {Promise}
     */
    write (data) {
        return this.characteristic.writeValue(data);
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
    handleOnDisconnected() {
        if ( null !== this.device ) {
            this.device.removeEventListener('gattserverdisconnected',this.onGattServerDisconnected);
            this.characteristic.removeEventListener('characteristicvaluechanged', this.characteristicvaluechanged);
        }

        this.device = null;
        this.characteristic = null;
        this.isConnected = false;
        
        this.isClosing = true;
        let $this = this;
        setTimeout(() => {
            if ( null != $this.closeResolve ) {
                $this.closeResolve();
            }
            $this.com.handleOnClose();
            $this.com.log('disconnect handled');
            $this.isClosing = false;
        }, 1000);
    }

    /**
     * get device title
     * @returns {String}
     */
    getDeviceTitle() {
        return this.deviceName;
    }
    
    /**
     * close the connection
     * @returns {Promise}
     */
    close() {
        let $this = this;
        return new Promise(( resolve ) => {
            if ( null == this.device || !$this.device.gatt.connected ) {
                resolve();
                return ;
            }

            $this.closeResolve = resolve;
            $this.device.gatt.disconnect();
        });
    }
}
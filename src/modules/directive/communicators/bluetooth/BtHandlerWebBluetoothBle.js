export default class BtHandlerWebBluetoothBle {
    /**
     * list of cached devices
     * @property {Object<id:BluetoothDevice>}
     */
    static devices = {};
    
    /**
     * cache given device
     * @param {BluetoothDevice} device 
     */
    static async cacheDevice( device ){
        if ( undefined !== BtHandlerWebBluetoothBle.devices[device.id] ) {
            return ;
        }
        
        if ( undefined != device.cacheDisconnectedCallback ) {
            device.removeEventListener('gattserverdisconnected', device.cacheDisconnectedCallback);
        }
        
        if ( !device.gatt.connected ) {
            await device.gatt.connect();
        }
        device.cacheDisconnectedCallback = event => delete BtHandlerWebBluetoothBle.devices[device.id];
        device.addEventListener('gattserverdisconnected', device.cacheDisconnectedCallback);
        BtHandlerWebBluetoothBle.devices[device.id] = device;
    }

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
         * instance of bluetooth device.
         * @property {BluetoothDevice|null}
         */
        this.device = null;
        /**
         * instance of characteristic
         * @property {BluetoothRemoteGattCharacteristic|null}
         */
        this.characteristic = null;
    }

    /**
     * open bluetooth connection
     * @returns {Promise}
     */
    async open() {
        let device = BtHandlerWebBluetoothBle.devices[this.com.options.btBleId];
        if ( undefined === device ) {
            device = await this.requestDevice();
        }

        if ( !device.gatt.connected ) {
            await device.gatt.connect();
        }
        let services = await device.gatt.getPrimaryServices();
        let service = services[0];
        let characteristic = await service.getCharacteristic(this.com.options.btBleCharId);
        await characteristic.startNotifications();
        
        // add event listener to value change event
        if ( undefined !== characteristic.valueChangeCallback ) {
            characteristic.removeEventListener(
                'characteristicvaluechanged', 
                characteristic.valueChangeCallback
            );
        }
        let charValueChanged = event => this.handleOnData(event);
        characteristic.valueChangeCallback = charValueChanged;
        characteristic.addEventListener('characteristicvaluechanged', charValueChanged);
        this.characteristic = characteristic;

        // add event listener for device disconnected.
        if ( undefined != device.disconnectedCallback ) {
            device.removeEventListener('gattserverdisconnected', device.disconnectedCallback);
        }
        device.disconnectedCallback = event => this.handleOnClose(event);
        device.addEventListener('gattserverdisconnected', device.disconnectedCallback);
        this.device = device;
    }

    /**
     * disconnect bluetooth device
     * @link https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTServer/disconnect
     * @returns {Promise}
     */
    async close() {
        this.device.gatt.disconnect();
        return Promise.resolve();
    }

    /**
     * write data to characteristic
     * @param {Buffer} data 
     * @returns {Promise}
     */
    write (data) {
        this.characteristic.writeValue(data);
        return Promise.resolve();
    }

    /**
     * request bluetooth device by given options
     * @returns {Promise<BluetoothDevice>}
     */
    requestDevice() {
        return new Promise(( resolve, reject ) => {
            window.app.$confirm({
                title: window.app.$t('directive.communicator.bluetooth.accessBluetoothDevice'),
                content: window.app.$t('directive.communicator.bluetooth.accessBluetoothDeviceTip'),
                onOk: () => {
                    let serviceId = this.com.options.btBleServiceId.toLowerCase();
                    if ( serviceId.startsWith('0x') ) {
                        serviceId = serviceId * 1;
                    }

                    let requestOptions = {};
                    requestOptions.optionalServices = [serviceId];
                    requestOptions.acceptAllDevices = true;
                    
                    navigator.bluetooth.requestDevice(requestOptions)
                    .then(device=>resolve(device))
                    .catch(e => reject(e));
                },
                onCancel: () => {
                    let messageKey = 'directive.communicator.bluetooth.unableToAccessBluetoothDevice';
                    reject({message:window.app.$t(messageKey)});
                },
                okText: window.app.$t('button.yes'),
                cancelText: window.app.$t('button.cancel'),
            });
        });
    }

    /**
     * get device title
     * @returns {String}
     */
    getDeviceTitle() {
        return this.device.name;
    }

    /**
     * event handler on bluetooth disconnected.
     * @link https://googlechrome.github.io/samples/web-bluetooth/device-disconnect.html
     */
    handleOnClose() {
        this.com.deviceDisconnected();
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
     * check if connection is open
     * @returns {Boolean}
     */
    getIsOpen() {
        return (null !== this.device && true === this.device.gatt.connected);
    }
}
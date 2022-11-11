import Common from '@/utils/Common.js'
/**
 * ble device scanner
 * @author sige
 */
export default class BleDeviceScanner {
    /**
     * the instance of scanner
     */
    static instance = null;

    /**
     * get ble device scanner
     * @returns {BleDeviceScanner}
     */
    static getScanner() {
        if ( null == BleDeviceScanner.instance ) {
            BleDeviceScanner.instance = new BleDeviceScanner();
        }
        return BleDeviceScanner.instance;
    }

    /**
     * constructor of ble device scanner
     */
    constructor() {
        this.devices = {};

        this.selectedDeviceId = null;
        this.serviceId = null;
        this.onRefreshCallback = () => {};
        this.onDeviceSelectedCallback = () => {};
        this.onStartCallback = () => {};
        this.onErrorCallback = () => {};
        this.refreshHandler = ( event, devices ) => this.handleRefresh(event, devices);
    }

    /**
     * get cached device by given uuid
     * @param {String} uuid 
     * @returns {BluetoothDevice}
     */
    getDevice( uuid ) {
        return undefined == this.devices[uuid] ? null : this.devices[uuid];
    }

    /**
     * set callback handler for error
     * @param {*} callback 
     */
    onError( callback ) {
        this.onErrorCallback = callback;
    }

    /**
     * set callback handler on refresh
     * @param {CallableFunction} callback 
     */
    onRefresh( callback ) {
        this.onRefreshCallback = callback;
    }

    /**
     * set callback handler on device selected
     * @param {CallableFunction} callback 
     */
    onDeviceSelected( callback ) {
        this.onDeviceSelectedCallback = callback;
    }

    /**
     * set callback handler for start
     * @param {CallableFunction} callback 
     */
    onStart( callback ) {
        this.onStartCallback = callback;
    }

    /**
     * start scanning
     * @returns {Promise}
     */
    start () {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            $this.askForPermission().then(() => {
                try {
                    $this.executeBluetoothRequestDevice();
                    resolve();
                } catch ( err ) {
                    reject(err);
                }
            }).catch(() => {
                reject(Error(window.app.$t('directive.communicator.bluetooth.unableToAccessBluetoothDevice')));
            });
        });
    }

    /**
     * execute bluetooth request device
     */
    executeBluetoothRequestDevice() {
        if ( Common.isEmpty(this.serviceId) ) {
            throw Error(window.app.$t('directive.communicator.bluetooth.serviceIdCannotBeEmpty'));
        }
        
        let serviceId = this.serviceId;
        if ( this.serviceId.toLowerCase().startsWith('0x') ) {
            serviceId = this.serviceId * 1;
        } else {
            serviceId = this.serviceId.toLowerCase();
        }
        
        let requestOptions = {};
        requestOptions.optionalServices = [serviceId];
        requestOptions.acceptAllDevices = true;

        this.log('scanning start');
        this.onStartCallback();
        
        let $this = this;
        window.ipcRenderer.on('select-bluetooth-device-refresh',this.refreshHandler);
        this.log('requestDevice : ', requestOptions);
        
        navigator.bluetooth.requestDevice(requestOptions).then((device) => {
            $this.handleOnDeviceSelected(device);
        }).catch((e) => {
            $this.onErrorCallback(e);
        }).finally(() => {
            window.ipcRenderer.off('select-bluetooth-device-refresh',$this.refreshHandler);
        });
    }

    /**
     * handler for device selected
     * @param {*} device 
     */
    handleOnDeviceSelected(device) {
        this.log('device selected', device);
        this.devices[this.selectedDeviceId] = device;
        this.onDeviceSelectedCallback(device);

        device.addEventListener('gattserverdisconnected', () => {
            let scanner = BleDeviceScanner.getScanner();
            for ( let devkey in scanner.devices ) {
                let devins = scanner.devices[devkey];
                if ( devins.id == this.id ) {
                    scanner.log(`device ${this.id} disconnected`);
                    scanner.devices[devkey] = null;
                    delete scanner.devices[devkey];
                }
            }
        });
    }

    /**
     * ask for permission to use bluetooth
     * @returns {Promise}
     */
    askForPermission() {
        return new Promise(( resolve, reject ) => {
            window.app.$confirm({
                title: window.app.$t('directive.communicator.bluetooth.accessBluetoothDevice'),
                content: window.app.$t('directive.communicator.bluetooth.accessBluetoothDeviceTip'),
                onOk() {  resolve(); },
                onCancel() { reject(); },
                okText: window.app.$t('button.yes'),
                cancelText: window.app.$t('button.cancel'),
            });
        });
    }

    /**
     * stop scanning
     */
    stop() {
        window.ipcRenderer.send('select-bluetooth-device-selected', '');
    }

    /**
     * select devive by given delveId
     * @param {String} deviceId 
     */
    select( deviceId ) {
        this.log('device select', deviceId);
        this.selectedDeviceId = deviceId;
        window.ipcRenderer.send('select-bluetooth-device-selected', deviceId);
    }

    /**
     * event handler for refresh
     * @param {Event} event 
     * @param {Array} devices 
     */
    handleRefresh(event, devices) {
        this.log('found devices', devices);
        this.onRefreshCallback(devices);
    }

    /**
     * request device by given device id
     * @param {string} deviceId
     * @returns {Promise}
     */
    requestDevice( deviceId ) {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            let foundDevices = [];
            
            // cancel handler on scanning ble devices
            let cancelHandler = () => {
                $this.log('auto request canceled, found devices : ', foundDevices);
                if ( 0 == foundDevices.length ) {
                    resolve(null);
                } else {
                    $this.select('');
                }
            };
            
            let refreshingModal = null;
            $this.onRefresh(function( devices ) {
                foundDevices = devices;
                for ( let i=0; i<devices.length; i++ ) {
                    if ( devices[i].deviceId == deviceId ) {
                        $this.log(`found device ${deviceId} in device list`);
                        $this.select(devices[i].deviceId);
                        return;
                    }
                }
                if ( null != refreshingModal ) {
                    return;
                }
                let tip = window.app.$t('directive.communicator.bluetooth.deviceScanTip');
                refreshingModal = window.app.$info({
                    title: window.app.$t('directive.communicator.bluetooth.deviceScan'),
                    content: h => <span>{tip} <a-icon type="loading" /></span>,
                    okText: window.app.$t('button.cancel'),
                    onOk : cancelHandler,
                });
            });

            $this.onDeviceSelected(function(device) {
                if ( null != refreshingModal ) {
                    refreshingModal.destroy();
                }
                resolve(device);
            });
            $this.onStart(() => $this.onRefreshCallback([]));
            $this.onError(() => resolve(null));
            $this.start().catch((err) => reject(err));
        });
    }

    /**
     * output log message to console.
     * @param {*} messages 
     */
     log (... messages ) {
        messages.unshift(`ble`);
        messages.unshift(`[bluetooth]`);
        console.log(...messages);
    }
}
import TargetEditor from '../TargetEditor.vue'
import Tester from '../../../../../utils/test/UnitTester.js'
import MdbRuntimeVariable from '../../../../../models/MdbRuntimeVariable.js'
describe('@/communicators/bluetooth/TargetEditor.vue', () => {
    it('editor config', async() => {
        let tester = new Tester();
        await tester.setup();

        let config = TargetEditor.editorConfig();
        expect(config.name).toBe('Bluetooth');
        expect(config.defaultDataType).toBe('byte');
        expect(config.defaultResponseViewer).toBe('hex');
    });

    it('classic', async() => {
        let bluetoothInquire = jest.fn(($this) => {
            setTimeout(() => {
                $this.eventHandlers.found('TEST-ADDRESS','');
                setTimeout(() => $this.eventHandlers.finished(), 100);
            }, 100);
        });
        window.bluetoothSerialPort = {};
        window.bluetoothSerialPort.BluetoothSerialPort = class {
            constructor() {
                this.eventHandlers = {};
            }
            on(name, callback) {
                this.eventHandlers[name] = callback;
            }
            inquire() {
                bluetoothInquire(this);
            }
        };
        
        let target = {};
        let tester = new Tester({
            props : {
                value : target,
            },
            listeners : {
                input : (newTarget) => target = newTarget
            },
        });
        await tester.setup();
        await tester.mount(TargetEditor);
        await tester.select({ref:'sltType'},'classic');
        await tester.click({ref:'btnClassicRefresh'});
        await tester.msleep(500);
        expect(tester.wrapper.vm.$data.devlist.length).toBe(1);

        bluetoothInquire.mockImplementationOnce(($this) => {
            setTimeout(() => $this.eventHandlers.finished(), 100);
        });
        await tester.click({ref:'btnClassicRefresh'});
        await tester.msleep(500);
        expect(tester.wrapper.vm.$data.devlist.length).toBe(0);
    });

    it('ble', async ( ) => {
        let oldConsoleLog = window.console.log;
        let oldConsoleError = window.console.error;
        window.console.log = () => {};
        window.console.error = jest.fn();

        let deviceGattGetPrimaryServices = jest.fn(() => {
            return [{
                getCharacteristics : () => {
                    return [{
                        uuid : 'TEST-CHAR-UUID',
                    }];
                }
            }];
        });
        let device = {
            id : 'TID',
            name : 'TNAME',
            gatt : {
                connected : true,
                disconnect : jest.fn(),
                connect : () => {
                    return {getPrimaryServices : deviceGattGetPrimaryServices}
                },
            }
        };
        let ipcRendererEventHandlers = {};
        let bluetoothRequestDevicePromise = {};
        let bluetoothRequestDevice = jest.fn(() => {
            return new Promise((resolve, reject) => {
                bluetoothRequestDevicePromise.resolve = resolve;
                bluetoothRequestDevicePromise.reject = reject;
            });
        });

        let target = {};
        let tester = new Tester({
            props : {
                value : target,
            },
            listeners : {
                input : (newTarget) => target = newTarget
            },
        });
        await tester.setup();
        await MdbRuntimeVariable.setVarValue('bluetooth_ble_history_service_ids', JSON.stringify([
            'U01','U02','U03','U04','U05','U06','U07','U08','U09','U10',
        ]));
        await tester.mount(TargetEditor);
        
        let ipcRendererSend = jest.fn(() => {});
        window.ipcRenderer = {
            on : (name,callback) => ipcRendererEventHandlers[name] = callback,
            off : (name, callback) => delete ipcRendererEventHandlers[name],
            send : ipcRendererSend,
        };
        window.app.$confirm = jest.fn((config) => {
            config.onOk();
        });
        navigator.bluetooth = {
            requestDevice : bluetoothRequestDevice,
        };

        await tester.select({ref:'sltType'},'ble');
        expect(target.btType).toBe('ble');

        await tester.click({ref:'btnBleDeviceRefresh'});
        expect(tester.dataGet('bleIsRefreshing')).toBeFalsy();
        
        await tester.input({ref:'txtBleServiceId'},'TEST-SERVICE-ID');
        
        // => click refresh button and failed to start inquiry
        bluetoothRequestDevice.mockImplementationOnce(() => {throw new Error('TEST-FAILED');});
        await tester.click({ref:'btnBleDeviceRefresh'});
        expect(window.console.error.mock.calls[0][0].message).toBe('TEST-FAILED');
        await tester.msleep(100);

        // => click refresh button and select device, but failed to `getPrimaryServices`
        await tester.click({ref:'btnBleDeviceRefresh'});
        // found new device
        ipcRendererEventHandlers['select-bluetooth-device-refresh']({}, [{deviceId:'TID',deviceName:'TNAME'}]);
        await tester.msleep(100);
        // select that device
        tester.wrapper.vm.target.btBleId = 'TID';
        ipcRendererSend.mockImplementationOnce((name, params) => {
            if ( 'select-bluetooth-device-selected' === name ) {
                bluetoothRequestDevicePromise.resolve(device);
            }
        });
        deviceGattGetPrimaryServices.mockImplementationOnce(() => { throw new Error('TEST-GATT-FAILED')});
        await tester.emit({ref:'selectDeviceId'},'select');
        await tester.msleep(100);
        expect(tester.dataGet('bleIsRefreshing')).toBeFalsy();
        
        // => click refresh button and select device, 
        await tester.click({ref:'btnBleDeviceRefresh'});
        // found new device
        ipcRendererEventHandlers['select-bluetooth-device-refresh']({}, [{deviceId:'TID',deviceName:'TNAME'}]);
        await tester.msleep(100);
        // select that device
        tester.wrapper.vm.target.btBleId = 'TID';
        ipcRendererSend.mockImplementationOnce((name, params) => {
            if ( 'select-bluetooth-device-selected' === name ) {
                bluetoothRequestDevicePromise.resolve(device);
            }
        });
        await tester.emit({ref:'selectDeviceId'},'select');
        await tester.msleep(100);

        // => click refresh button and stop it, 
        await tester.click({ref:'btnBleDeviceRefresh'});
        // found new device
        ipcRendererEventHandlers['select-bluetooth-device-refresh']({}, [{deviceId:'TID',deviceName:'TNAME'}]);
        await tester.msleep(100);
        ipcRendererSend.mockImplementationOnce((name, params) => {
            if ( 'select-bluetooth-device-selected' === name ) {
                bluetoothRequestDevicePromise.reject('USER-CANCELED');
            }
        });
        await tester.click({ref:'btnBleDeviceRefreshStop'});
        await tester.msleep(100);
        expect(tester.dataGet('bleIsRefreshing')).toBeFalsy();

        window.console.log = oldConsoleLog;
        window.console.error = oldConsoleError;
    }, 20000)
});
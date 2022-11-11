import Tester from '../../../../../utils/test/UnitTester.js';
import BleDeviceScanner from '../BleDeviceScanner.js'
describe('@/communicators/bluetooth/BleDeviceScanner.spec.js', () => {
    let BleDevice = class {
        constructor(id) {
            this.deviceId = id;
            this.eventHandlers = {};
            
            let $this = this;
            this.gatt = {
                disconnect() {
                    $this.eventHandlers['gattserverdisconnected']();
                }
            };
        }
        addEventListener( name, callback ) {
            this.eventHandlers[name] = callback;
        }
    };

    it('search device and connect', async ( ) => {
        let tester = new Tester();
        await tester.setup();
        
        let windowAppConfirm = jest.fn(( options ) => options.onOk());
        window.app.$confirm = windowAppConfirm;
        window.console.log = () => {};

        let ipcHandlers = {};
        window.ipcRenderer = {};
        window.ipcRenderer.on = function( event, handler ) {
            ipcHandlers[event] = handler;
        };
        window.ipcRenderer.off = function(eventName) {
            delete ipcHandlers[eventName];
        }
        window.ipcRenderer.send = function(name, data) {
            if ( 'select-bluetooth-device-selected' == name ) {
                navigator.bluetooth.requestDeviceActResolve(new BleDevice('TEST-DEV-001'));
            }
        }

        navigator.bluetooth = {
            requestDeviceActResolve : null,
            requestDeviceActReject : null,
        };
        navigator.bluetooth.requestDevice = function( options ) {
            return new Promise(( resolve, reject ) => {
                navigator.bluetooth.requestDeviceActResolve = resolve;
                navigator.bluetooth.requestDeviceActReject = reject;
                setTimeout(() => {
                    ipcHandlers['select-bluetooth-device-refresh'](null, [new BleDevice('TEST-DEV-001'), new BleDevice('TEST-DEV-002')]);
                }, 100);
            });
        }

        // test start
        let scanner = BleDeviceScanner.getScanner();

        // service id is required
        await tester.expectError(async () => await scanner.start(),'Please input service name or UUID');
        scanner.serviceId = 'FFE0';

        // user permission failed
        windowAppConfirm.mockImplementationOnce((options) => options.onCancel());
        await tester.expectError(async () => await scanner.start(), 'unable to access bluetooth device');

        // start to scan device
        let selectedDevice = null;
        scanner.onRefresh(() => scanner.select('TEST-DEV-001'));
        scanner.onDeviceSelected((device) => selectedDevice = device);
        await scanner.start();
        await tester.msleep(1000);
        expect(selectedDevice.deviceId).toBe('TEST-DEV-001');
        expect(scanner.getDevice('TEST-DEV-001')).toBe(selectedDevice);
        expect(scanner.devices).toHaveProperty('TEST-DEV-001');
        selectedDevice.gatt.disconnect();
        expect(scanner.devices).not.toHaveProperty('TEST-DEV-001');
    })

    it('request device and auto select', async () => {
        let tester = new Tester();
        await tester.setup();
        
        let winAppInfoModal = jest.fn(( options ) => {
            return {destroy:()=>{}};
        });
        window.app.$info = winAppInfoModal;
        
        let ipcRendererSend = jest.fn(() => {});
        let ipcHandlers = {};
        window.ipcRenderer = {};
        window.ipcRenderer.on = function( event, handler ) {
            ipcHandlers[event] = handler;
        };
        window.ipcRenderer.off = function(eventName) {
            delete ipcHandlers[eventName];
        }
        window.ipcRenderer.send = ipcRendererSend;

        navigator.bluetooth = {};
        window.app.$confirm = function( options ) {
            options.onOk();
        };
        
        // test start
        let scanner = new BleDeviceScanner();
        scanner.serviceId = '0xFF';

        // request device and canel it with empty device list
        winAppInfoModal.mockImplementationOnce((opt) => opt.onOk());
        navigator.bluetooth.requestDevice = ( options ) => {
            return new Promise(() => {});
        }
        let device = await scanner.requestDevice('TEST-DEV-001');
        expect(device).toBeNull();

        // request device and cancel it with device list contains on device
        ipcRendererSend.mockImplementationOnce((name, data) => {
            if ( 'select-bluetooth-device-selected' == name ) {
                navigator.bluetooth.requestDeviceActReject("USER-CANCEL");
            }
        });
        let winAppInfoModalOptions = null;
        winAppInfoModal.mockImplementationOnce((opt) => winAppInfoModalOptions = opt);
        navigator.bluetooth.requestDevice = ( options ) => {
            return new Promise(( resolve, reject ) => {
                navigator.bluetooth.requestDeviceActReject = reject;
                setTimeout(() => {
                    ipcHandlers['select-bluetooth-device-refresh'](null, [{deviceId:'TEST-DEV-002'}]);
                }, 100);

                setTimeout(() => {
                    winAppInfoModalOptions.content(() => {});
                    winAppInfoModalOptions.onOk();
                }, 200);
            });
        }
        device = await scanner.requestDevice('TEST-DEV-001');
        expect(device).toBeNull();

        // request device and get device intance
        ipcRendererSend.mockImplementationOnce((name, data) => {
            if ( 'select-bluetooth-device-selected' == name ) {
                navigator.bluetooth.requestDeviceActResolve({deviceId:'TEST-DEV-001'});
            }
        });
        navigator.bluetooth.requestDevice = function( options ) {
            return new Promise(( resolve, reject ) => {
                navigator.bluetooth.requestDeviceActResolve = resolve;
                navigator.bluetooth.requestDeviceActReject = reject;
                setTimeout(() => {
                    ipcHandlers['select-bluetooth-device-refresh'](null, [{deviceId:'TEST-DEV-002'}]);
                    ipcHandlers['select-bluetooth-device-refresh'](null, [{deviceId:'TEST-DEV-001'}]);
                }, 100);
            });
        }
        device = await scanner.requestDevice('TEST-DEV-001');
        expect(device.deviceId).toBe('TEST-DEV-001');

        // request device and stop the inquiry
        navigator.bluetooth.requestDevice = function( options ) {
            return new Promise(( resolve, reject ) => {
                scanner.stop();
            });
        }
        device = await scanner.requestDevice('TEST-DEV-002');
        expect(device).toBeNull();

        // failed to start
        navigator.bluetooth.requestDevice = function( options ) {
            throw "FAILE START ERROR";
        }
        await tester.expectError(async () => await scanner.requestDevice('TEST-DEV-001'), 'FAILE START ERROR');
    })
});
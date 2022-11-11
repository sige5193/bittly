import Tester from '../../../../../utils/test/UnitTester.js';
import Communicator from '../Communicator.js'
describe('@/communicators/bluetooth/BleHandler.js', () => {
    it('normal use', async () => {
        let tester = new Tester();
        await tester.setup();
        window.console.log = () => {};

        // env setup
        window.app.$confirm = function( options ) {
            options.onOk();
        };
        window.app.$info = function( options ) {
            return {destroy:()=>{}};
        }

        let device = {
            deviceId:'TEST_BLE_ID',
            eventHandlers : {},
            addEventListener : function( name, callback ) {
                this.eventHandlers[name] = callback;
            },
            removeEventListener: function() {},
            gatt : {
                connected : false,
                connect() {
                    this.connected = true;
                },
                disconnect() {
                    device.eventHandlers['gattserverdisconnected']();
                },
                getPrimaryServices() {
                    return [{
                        getCharacteristic() {
                            return {
                                eventHandlers : {},
                                addEventListener(name, callback){
                                    this.eventHandlers[name] = callback;
                                },
                                removeEventListener: function() {},
                                startNotifications() {
                                    return Promise.resolve();
                                },
                                writeValue(data) {
                                    let $this = this;
                                    setTimeout(function() {
                                        $this.eventHandlers['characteristicvaluechanged']({target:{value:data}})
                                    }, 500);
                                    return Promise.resolve();
                                },
                            };
                        }
                    }];
                }
            },
        };
        let ipcHandlers = {};
        window.ipcRenderer = {};
        window.ipcRenderer.on = function( event, handler ) {
            ipcHandlers[event] = handler;
        };
        window.ipcRenderer.off = function(eventName) {
            delete ipcHandlers[eventName];
        }
        
        let bluetoothRequestDevice = jest.fn((options) => Promise.resolve());
        navigator.bluetooth = {requestDevice : bluetoothRequestDevice};

        // check parameters
        let btOptions = {btType : 'ble'};
        await tester.expectError(async() => await Communicator.setup(btOptions),'Please select the device to connect');
        btOptions.btBleId = 'TEST_BLE_ID';
        await tester.expectError(async() => await Communicator.setup(btOptions),'Please input service name or UUID');
        btOptions.btBleServiceId = 'TEST_BLE_SERVER_ID';
        await tester.expectError(async() => await Communicator.setup(btOptions),'Please select characteristic');
        btOptions.btBleCharId = 'TEST_BLE_CHAR_ID';

        let com = await Communicator.setup(btOptions);
        expect(com.getIsOpen()).toBeFalsy();
        let response = null;
        com.onData(( data ) => response = data);

        // open and unable to find device
        let oldWindowAppInfoModal = window.app.$info;
        window.app.$info = ( opt ) => opt.onOk();
        bluetoothRequestDevice.mockImplementationOnce(( options ) => {
            return new Promise(( resolve, reject ) => {});
        });
        await tester.expectError(async () => await com.open(), 'Unable to connect to device TEST_BLE_ID');
        window.app.$info = oldWindowAppInfoModal;

        // open connection
        bluetoothRequestDevice.mockImplementationOnce(( options ) => {
            return new Promise(( resolve, reject ) => {
                window.ipcRenderer.send = function(name, data) {
                    if ( 'select-bluetooth-device-selected' == name ) {
                        resolve(device);
                    }
                }
                setTimeout(()=>{
                    ipcHandlers['select-bluetooth-device-refresh'](null, [{deviceId:'TEST_BLE_ID'}, {deviceId:'TEST-DEV-002'}]);
                }, 100);
            });
        });
        await com.open();
        await com.open();
        expect(com.handler.getDeviceTitle()).toBe('TEST_BLE_ID');

        await tester.msleep(100);
        await com.write({buffer:'TEST'});
        await tester.msleep(1000);
        expect(response.toString()).toBe('TEST');

        await com.close();
        expect(com.getIsOpen()).toBeFalsy();

        await com.close();
    })
});
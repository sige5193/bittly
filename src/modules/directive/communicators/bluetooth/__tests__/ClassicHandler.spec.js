import Tester from '../../../../../utils/test/UnitTester.js';
import Communicator from '../Communicator.js'
import ClassicHandler from '../ClassicHandler.js'
describe('@/communicators/bluetooth/ClassicHandler.js', () => {
    it('basic', async () => {
        let tester = new Tester();
        await tester.setup();
        
        // env setup
        let bluetoothWrite = jest.fn(($this, data, callback) => {
            callback(undefined, data.length);
            $this.eventHandlers['data'](data);
        });
        let bluetoothFindSerialPortChannel = jest.fn(($this, address, success, error) => {
            expect(address).toBe('BT-ADDRESS');
            success('CH_01');
        });
        let bluetoothConnect = jest.fn(($this,address, channel, success,error) => {
            expect(address).toBe('BT-ADDRESS');
            expect(channel).toBe('CH_01');
            success();
        });
        let bluetoothInquire = jest.fn(($this) => {});
        window.bluetoothSerialPort = {};
        window.bluetoothSerialPort.BluetoothSerialPort = class {
            constructor() {
                this.eventHandlers = {};
            }
            on( eventName, callback ) { this.eventHandlers[eventName] = callback; }
            findSerialPortChannel( address, success, error ) {bluetoothFindSerialPortChannel(this,address, success, error);}
            connect(address, channel, success, error) { bluetoothConnect(this, address, channel, success, error); }
            write( data, callback ) { bluetoothWrite(this, data, callback); }
            close() {this.eventHandlers['closed']();}
            inquire() {bluetoothInquire(this);}
        };

        let btOptions = {};
        btOptions.btType = 'classic';
        
        // address is required
        await tester.expectError(async () => await Communicator.setup(btOptions),'Please select device');
        await tester.msleep(100);

        btOptions.btAddress = 'BT-ADDRESS';
        let com = await Communicator.setup(btOptions);
        expect(com.getIsOpen()).toBeFalsy();
        let response = null;
        com.onData((data) => response = data);

        // failed to find device 
        bluetoothFindSerialPortChannel.mockImplementationOnce(($this, address, success, error) => error());
        await tester.expectError(async () => await com.open(), 'Unable to find serial port channel BT-ADDRESS');

        // failed to connect
        bluetoothConnect.mockImplementationOnce(($this,address, channel, success, error) => error());
        await tester.expectError(async () => await com.open(), 'Unable to connect to device BT-ADDRESS');

        await com.open();
        expect(com.getIsOpen()).toBeTruthy();
        
        // failed to write at first time
        bluetoothWrite.mockImplementationOnce(($this, data, callback) => callback("TEST-WRITE-ERROR",null));
        await tester.expectError(async() => await com.write('TEST'), 'TEST-WRITE-ERROR');

        await com.write('TEST')
        await tester.msleep(100);
        expect(response).toBe('TEST');

        await com.close();
        expect(com.getIsOpen()).toBeFalsy();

        // other actions
        await tester.expectError(async () => await com.handler.btSerial.eventHandlers.failure('TEST-FAILURE'),'TEST-FAILURE');
        com.handler.btSerial.eventHandlers.closed();
        com.handler.btSerial.eventHandlers.data('NOTHING');

        // ClassicHandler.list
        bluetoothInquire.mockImplementationOnce(($this) => {
            $this.eventHandlers.found('ADDRESS','NAME');
            $this.eventHandlers.finished();
        });
        let list = await ClassicHandler.list();
        expect(list.length).toBe(1);
        expect(list[0].name).toBe('NAME');
        expect(list[0].address).toBe('ADDRESS');
    })
});
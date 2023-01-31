import Tester from '../../../../../utils/test/UnitTester.js';
import Communicator from '../Communicator.js'
import BtHandlerClassic from '../BtHandlerClassic.js'
describe('@/communicators/bluetooth/BtHandlerClassic.js', () => {
    let mockBluetoothSerialport = () => {
        let btMock = {};
        btMock.write = jest.fn(($this, data, callback) => {
            callback(undefined, data.length);
            $this.eventHandlers['data'](data);
        });
        btMock.findSerialPortChannel = jest.fn(($this, address, success, error) => {
            expect(address).toBe('BT-ADDRESS');
            success('CH_01');
        });
        btMock.connect = jest.fn(($this,address, channel, success,error) => {
            $this.stateIsOpen = true;
            expect(address).toBe('BT-ADDRESS');
            expect(channel).toBe('CH_01');
            success();
        });
        btMock.close = jest.fn(($this) => {
            $this.stateIsOpen = false; 
            $this.eventHandlers['closed']();
        });
        btMock.isOpen = jest.fn(($this) => {
            return $this.stateIsOpen;
        });
        btMock.inquire = jest.fn(($this) => {});
        
        window.bluetoothSerialPort = {};
        window.bluetoothSerialPort.BluetoothSerialPort = class {
            constructor() {
                this.stateIsOpen = false;
                this.eventHandlers = {};
            }
            on( eventName, callback ) { this.eventHandlers[eventName] = callback; }
            findSerialPortChannel( address, success, error ) {btMock.findSerialPortChannel(this,address, success, error);}
            connect(address, channel, success, error) {btMock.connect(this, address, channel, success, error); }
            write( data, callback ) { btMock.write (this, data, callback); }
            close() {btMock.close(this)}
            inquire() {btMock.inquire(this);}
            isOpen() { return btMock.isOpen(this);}
        };

        return btMock;
    };

    it('basic', async () => {
        let tester = new Tester();
        await tester.setup();
        let btMock = mockBluetoothSerialport();

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
        btMock.findSerialPortChannel.mockImplementationOnce(($this, address, success, error) => error());
        await tester.expectError(async () => await com.open(), 'Unable to find serial port channel BT-ADDRESS');

        // failed to connect
        btMock.connect.mockImplementationOnce(($this,address, channel, success, error) => error());
        await tester.expectError(async () => await com.open(), 'Unable to connect to device BT-ADDRESS');

        await com.open();
        expect(com.getIsOpen()).toBeTruthy();
        
        // failed to write at first time
        btMock.write.mockImplementationOnce(($this, data, callback) => callback("TEST-WRITE-ERROR",null));
        await tester.expectError(async() => await com.write('TEST'), 'TEST-WRITE-ERROR');

        await com.write('TEST')
        await tester.msleep(100);
        expect(response).toBe('TEST');

        await com.close();
        expect(com.getIsOpen()).toBeFalsy();

        // other actions
        com.handler.btSerial.eventHandlers.closed();
        com.handler.btSerial.eventHandlers.data('NOTHING');

        // BtHandlerClassic.list
        btMock.inquire.mockImplementationOnce(($this) => {
            $this.eventHandlers.found('ADDRESS','NAME');
            $this.eventHandlers.finished();
        });
        let list = await BtHandlerClassic.list();
        expect(list.length).toBe(1);
        expect(list[0].name).toBe('NAME');
        expect(list[0].address).toBe('ADDRESS');
    })

    it('show toast on failure', async () => {
        let tester = new Tester();
        await tester.setup();
        mockBluetoothSerialport();

        let btOptions = {};
        btOptions.btType = 'classic';
        btOptions.btAddress = 'BT-ADDRESS';
        let com = await Communicator.setup(btOptions);
        
        await com.open();
        expect(com.getIsOpen()).toBeTruthy();

        // trigger failure event
        com.toast = jest.fn();
        await com.handler.btSerial.eventHandlers.failure({message:'TEST-FAILURE'});
        expect(com.toast).toBeCalled();
        expect(com.toast.mock.calls[0][0]).toBe('TEST-FAILURE');
    });
});
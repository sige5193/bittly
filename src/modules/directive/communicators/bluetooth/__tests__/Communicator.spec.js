import Tester from '../../../../../utils/test/UnitTester.js';
import Communicator from '../Communicator.js'
describe('@/communicators/bluetooth/Communicator.js', () => {
    it('classic', async () => {
        let tester = new Tester();
        await tester.setup();
        
        // env setup
        let bluetoothFindSerialPortChannel = jest.fn(($this,address,callback) => callback('CH_01'));
        window.bluetoothSerialPort = {};
        window.bluetoothSerialPort.BluetoothSerialPort = class {
            constructor() {
                this.eventHandlers = {};
            }
            on( eventName, callback ) {
                this.eventHandlers[eventName] = callback;
            }
            findSerialPortChannel( address, successCallback ) {
                bluetoothFindSerialPortChannel(this, address, successCallback);
            }
            connect(address, channel, successCallback) {
                expect(address).toBe('TEST-ADDRESS');
                expect(channel).toBe('CH_01');
                successCallback();
            }
            write( data, callback ) {
                callback(undefined, data.length);
                this.eventHandlers['data'](data);
            }
            close() {
                this.eventHandlers['closed']();
            }
        };

        // classic
        let com = await Communicator.setup({btType:'classic',btAddress:'TEST-ADDRESS'});
        let response = null;
        com.onData((data) => response = data);

        // failed to open at first time
        bluetoothFindSerialPortChannel.mockImplementationOnce(() => {throw new Error('TEST ERROR');});
        await tester.expectError(async () => await com.open(), 'TEST ERROR');

        // open success
        expect(com.getIsOpen()).toBeFalsy();
        await com.open();
        expect(com.getIsOpen()).toBeTruthy();
        
        // write data
        await com.write('TEST');
        await tester.msleep(100);
        expect(response).toBe('TEST');
        await com.close();
        expect(com.getIsOpen()).toBeFalsy();
    }, 10000)

    it('ble', async () => {
        let tester = new Tester();
        await tester.setup();

        let targetOptions = {btType:'ble',btBleId:'ID',btBleServiceId:'SID',btBleCharId:'CID'};
        let com = await Communicator.setup(targetOptions);
        let response = null;
        com.onData((data) => response = data);
        com.handler.isClosing = true;
    }, 10000)
});
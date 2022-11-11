import Tester from '../../../../../utils/test/UnitTester.js'
import ModbusMocker from '../ModbusMocker.js';
import SerialPortMocker from '../../serialport/SerialPortMocker.js'
import Buffer from '../../../../../utils/test/Buffer.js';
import Communicator from '../Communicator.js'
describe('@/communicators/modbus/Communicator.js', () => {
    it('modbus tcp-ip with func code 01', async () => {
        ModbusMocker.setup();
        let tester = new Tester();
        await tester.setup();
        
        let options = {modbusMode:'TCP-IP',modbusHost:'127.0.0.1',modbusPort:'8080',modbusSlaveId:'1',modbusFuncCode:'01', modbusAddress:'0',modbusLength:'1'};
        let com = await Communicator.setup(options);
        
        // failed to open at first time
        ModbusMocker.mock.connectTCP.mockImplementationOnce(($this, host, opt, callback) => callback("OPEN-FAILED"));
        await tester.expectError(async () => await com.open(), 'OPEN-FAILED');
        // now, open it again
        await com.open();
        expect(com.getIsOpen()).toBeTruthy();
        
        let response = null;
        com.onData(( data ) => response = data);

        // failed at first time
        ModbusMocker.mock.readCoils.mockImplementationOnce(($this, address,length,callback) => callback("WRITE-FAILED",null));
        await tester.expectError(async () => await com.write(''), 'WRITE-FAILED');

        // write again and get response
        com.write('');
        await tester.msleep(200);
        expect(response).toBe('HELLO');

        com.client.eventHandlers.error({errno:'ECONNREFUSED'});
        await tester.msleep(100);
    });

    it('modbus ascii with func code 02', async () => {
        ModbusMocker.setup();
        let tester = new Tester();
        await tester.setup();
        
        let options = {modbusMode:'ASCII',modbusSerialport:'COM1',modbusParity:'9600',modbusSlaveId:'1',modbusFuncCode:'02', modbusAddress:'0',modbusLength:'1'};
        let com = await Communicator.setup(options);
        
        // failed to open at first time
        ModbusMocker.mock.connectAsciiSerial.mockImplementationOnce(($this, port, opt, callback) => callback("OPEN-FAILED"));
        await tester.expectError(async () => await com.open(), 'OPEN-FAILED');
        // now, open it again
        await com.open();
        expect(com.getIsOpen()).toBeTruthy();
        
        let response = null;
        com.onData(( data ) => response = data);

        // failed at first time
        ModbusMocker.mock.readDiscreteInputs.mockImplementationOnce(($this, address,length,callback) => callback("WRITE-FAILED",null));
        await tester.expectError(async () => await com.write(''), 'WRITE-FAILED');

        // write again and get response
        com.write('');
        await tester.msleep(200);
        expect(response).toBe('HELLO');

        await tester.expectError(async () => com.client.eventHandlers.error({message:'UNKNOWN'}), 'UNKNOWN');
        await tester.msleep(100);
    });

    it('modbus rtu with func code 03', async () => {
        ModbusMocker.setup();
        SerialPortMocker.mock();

        let tester = new Tester();
        await tester.setup();
        
        let list = await Communicator.listSerialPorts();
        expect(list.length).toBe(0);

        let options = {modbusMode:'RTU',modbusSerialport:'COM1',modbusParity:'9600',modbusSlaveId:'1',modbusFuncCode:'03', modbusAddress:'0',modbusLength:'1'};
        options.modbusByteSwapEnable = true;
        let com = await Communicator.setup(options);
        
        // failed to open at first time
        ModbusMocker.mock.connectRTUBuffered.mockImplementationOnce(($this, port, opt, callback) => callback("OPEN-FAILED"));
        await tester.expectError(async () => await com.open(), 'OPEN-FAILED');
        // now, open it again
        await com.open();
        expect(com.getIsOpen()).toBeTruthy();
        
        let response = null;
        com.onData(( data ) => response = data);

        // failed at first time
        ModbusMocker.mock.readHoldingRegisters.mockImplementationOnce(($this, address,length,callback) => callback("WRITE-FAILED",null));
        await tester.expectError(async () => await com.write(''), 'WRITE-FAILED');

        // write again and get response
        ModbusMocker.mock.readHoldingRegisters.mockImplementationOnce(($this, address,length,callback) => callback(null,{buffer:Buffer.from('HELLO')}));
        com.write('');
        await tester.msleep(200);
        expect(response.toString()).toBe('HELLO');

        // close connection
        await com.close();
    });
    
    it('execute func code 04', async () => {
        ModbusMocker.setup();
        let tester = new Tester();
        await tester.setup();
        
        let response = null;
        let options = {modbusMode:'TCP-IP',modbusHost:'127.0.0.1',modbusPort:'8080',modbusSlaveId:'1',modbusFuncCode:'04', modbusAddress:'0',modbusLength:'1'};
        let com = await Communicator.setup(options);
        com.onData(( data ) => response = data);
        await com.open();
        expect(com.getIsOpen()).toBeTruthy();

        // write data
        com.write('');
        await tester.msleep(200);
        expect(response).toBe('HELLO');

        // close connection
        await com.close();
    });

    it('execute func code 05', async () => {
        ModbusMocker.setup();
        let tester = new Tester();
        await tester.setup();
        
        let options = {modbusMode:'TCP-IP',modbusHost:'127.0.0.1',modbusPort:'8080',modbusSlaveId:'1',modbusFuncCode:'05', modbusAddress:'0',modbusLength:'0'};
        let com = await Communicator.setup(options);
        com.onData(( data ) => response = data);
        await com.open();
        expect(com.getIsOpen()).toBeTruthy();

        // write data
        com.write('AAA');
        await tester.msleep(200);
        expect(ModbusMocker.mock.writeCoil.mock.calls[0][2]).toBe('A');

        // error on empty data
        await tester.expectError(async () => com.write(''), 'Write data can not be empty');
        
        // close connection
        await com.close();
    });

    it('execute func code 06', async () => {
        ModbusMocker.setup();
        Buffer.setup();

        let tester = new Tester();
        await tester.setup();
        
        let options = {modbusMode:'TCP-IP',modbusHost:'127.0.0.1',modbusPort:'8080',modbusSlaveId:'1',modbusFuncCode:'06', modbusAddress:'0',modbusLength:'0',modbusByteSwapEnable:true};
        let com = await Communicator.setup(options);
        com.onData(( data ) => response = data);
        await com.open();
        expect(com.getIsOpen()).toBeTruthy();

        // write data
        com.write(Buffer.from('AAA'));
        await tester.msleep(200);
        expect(ModbusMocker.mock.writeRegister.mock.calls[0][2].toString()).toBe('AAA');

        // error on empty data
        await tester.expectError(async () => com.write(''), 'Write data can not be empty');
        
        // close connection
        await com.close();
    });

    it('execute func code 15', async () => {
        ModbusMocker.setup();
        Buffer.setup();

        let tester = new Tester();
        await tester.setup();
        
        let options = {modbusMode:'TCP-IP',modbusHost:'127.0.0.1',modbusPort:'8080',modbusSlaveId:'1',modbusFuncCode:'15', modbusAddress:'0',modbusLength:'0',modbusByteSwapEnable:true};
        let com = await Communicator.setup(options);
        com.onData(( data ) => response = data);
        await com.open();
        expect(com.getIsOpen()).toBeTruthy();

        // write data
        com.write([1,2,3]);
        await tester.msleep(200);
        expect(ModbusMocker.mock.writeCoils.mock.calls[0][2].toString()).toBe('0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1');

        // error on empty data
        await tester.expectError(async () => com.write(''), 'Write data can not be empty');
        
        // close connection
        await com.close();
    });

    it('execute func code 16', async () => {
        ModbusMocker.setup();
        Buffer.setup();

        let tester = new Tester();
        await tester.setup();
        
        let options = {modbusMode:'TCP-IP',modbusHost:'127.0.0.1',modbusPort:'8080',modbusSlaveId:'1',modbusFuncCode:'16', modbusAddress:'0',modbusLength:'0',modbusByteSwapEnable:true};
        let com = await Communicator.setup(options);
        com.onData(( data ) => response = data);
        await com.open();
        expect(com.getIsOpen()).toBeTruthy();

        // write data
        com.write(Buffer.from('AAA'));
        await tester.msleep(200);
        expect(ModbusMocker.mock.writeRegisters.mock.calls[0][2].toString()).toBe('AAA');

        // error on empty data
        await tester.expectError(async () => com.write(''), 'Write data can not be empty');
        
        // close connection
        await com.close();
    });

    it('wrong func code', async () => {
        ModbusMocker.setup();
        let tester = new Tester();
        await tester.setup();
        
        let options = {modbusMode:'TCP-IP',modbusHost:'127.0.0.1',modbusPort:'8080',modbusSlaveId:'1',modbusFuncCode:'FF', modbusAddress:'0',modbusLength:'0',modbusByteSwapEnable:true};
        let com = await Communicator.setup(options);
        com.onData(( data ) => response = data);
        await com.open();
        expect(com.getIsOpen()).toBeTruthy();

        // error on empty data
        await tester.expectError(async () => com.write('AAA'), 'Function code does not support FF');

        // close connection
        await com.close();
    });
});
import TargetEditor from '../TargetEditor.vue'
import Tester from '../../../../../utils/test/UnitTester.js'
import MockSerialport from '../../serialport/__tests__/mocks/MockSerialport';
describe('@/communicators/modbus/TargetEditor.vue', () => {
    it('target editor basic', async () => {
        let tester = new Tester();
        await tester.setup();

        let config = TargetEditor.editorConfig();
        expect(config.name).toBe('Modbus');
        expect(config.defaultDataType).toBe('short');
        expect(config.defaultResponseViewer).toBe('hex');
    });
    
    it('modbus-RTU', async ( ) => {
        let mock = MockSerialport.setup();
        mock.list.mockImplementation(() => Promise.resolve([{path:'COM1'},{path:'COM2'}]));

        let target = {};
        let tester = new Tester({
            props : {
                value : target,
            },
            listeners : {
                input : ( newTarget ) => target = newTarget
            },
        });
        await tester.setup();
        await tester.mount(TargetEditor);

        // refresh serialport list
        await tester.click({ref:'btnSerialPortRefresh'});

        // select mode as Modbus-RTU
        await tester.select({ref:'sltMode'}, 'RTU');
        expect(target.modbusMode).toBe('RTU');

        // set serial port
        await tester.input({ref:'txtSerialport'},'COM8');
        expect(target.modbusSerialport).toBe('COM8');
        
        // set baud rate
        await tester.input({ref:'txtBaudRate'},'115200');
        expect(target.modbusBaudRate).toBe('115200');
        
        // set slave id
        await tester.input({ref:'txtSlaveId'},'1');
        expect(target.modbusSlaveId).toBe('1');
        
        // slect function code
        await tester.select({ref:'sltFuncCode'}, '01');
        expect(target.modbusFuncCode).toBe('01');

        // set data addree
        await tester.input({ref:'txtAddress'}, '1');
        expect(target.modbusAddress).toBe('1');

        // set data length
        await tester.input({ref:'txtLength'}, '2');
        expect(target.modbusLength).toBe('2');

        // enable setting modal
        await tester.click({ref:'btnSetting'});
        await tester.select({ref:'sltDataBits'}, '5');
        await tester.select({ref:'sltStopBits'}, '2');
        await tester.select({ref:'sltParity'}, 'space');
        expect(target.modbusDataBits).toBe('8');
        expect(target.modbusStopBits).toBe('1');
        expect(target.modbusParity).toBe('none');
        await tester.emit({ref:'modalSetting'},'ok');
        expect(target.modbusDataBits).toBe('5');
        expect(target.modbusStopBits).toBe('2');
        expect(target.modbusParity).toBe('space');
    }, 10000)

    it('modbus-TCP', async ( ) => {
        let target = {};
        
        let tester = new Tester({
            props : {
                value : target,
            },
            listeners : {
                input : ( newTarget ) => target = newTarget
            },
        });
        await tester.setup();
        let wrapper = await tester.mount(TargetEditor);
        
        // select mode as Modbus-RTU
        await tester.select({ref:'sltMode'}, 'TCP-IP');
        expect(target.modbusMode).toBe('TCP-IP');

        // set host
        await tester.input({ref:'txtHost'},'192.168.1.1');
        expect(target.modbusHost).toBe('192.168.1.1');

        // slect function code
        await tester.select({ref:'sltFuncCode'}, '05');
        expect(target.modbusFuncCode).toBe('05');
        expect(tester.wrapper.findComponent({ref:'txtLength'}).exists()).toBeFalsy();
    })
});
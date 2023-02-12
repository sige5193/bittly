import MdbMock from '../../../../../models/MdbMock.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import MockSerialport from '../../../../directive/communicators/serialport/__tests__/mocks/MockSerialport.js';
import MockService from '../MockService.js'
describe('@/src/modules/mock/mockers/serialport/MockService.js', () => {
    it('debug basic', async () => {
        let tester = new Tester();
        await tester.setup();

        let mock = new MdbMock();
        mock.type = 'serialport';
        mock.options.path = 'COM1';
        mock.options.baudRate = '9600';
        mock.options.dataBits = '8';
        mock.options.stopBits = '1';
        mock.options.parity = 'none';
        mock.options.responseMatchRules = [
            {key:0,enable:true,name:"R01",matchHandler:"All",responseHandler:"Text",responseContent:{"content":"HELLO","nlStyle":"CRLF"}},
            {key:1,enable:true,name:"R02",matchHandler:"All",responseHandler:"Text"}
        ];
        await mock.save();
        
        let serialport = MockSerialport.setup();
        serialport.enableEcho = false;

        let service = new MockService(mock);
        await service.start();
        await tester.msleep(500);
        
        serialport.response("HELLO");
        await tester.msleep(1000);
        expect(serialport.write).toBeCalledTimes(1);
        
        await service.stop();
    })
});
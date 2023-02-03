import MdbMock from '../../../../../models/MdbMock.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import MockSerialport from '../../../../directive/communicators/serialport/__tests__/mocks/MockSerialport.js';
import MockViewer from '../MockViewer.vue'
describe('@/src/modules/mock/mockers/tcp/MockViewer.vue', () => {
    it('basic', async () => {
        let tester = new Tester();
        await tester.setup();

        let mock = new MdbMock();
        mock.type = 'serialport';
        mock.options.path = 'COM1';
        mock.options.baudRate = '9600';
        mock.options.dataBits = '8';
        mock.options.stopBits = '1';
        mock.options.parity = 'none';
        await mock.save();
        tester.prop('value', mock);

        let serialport = MockSerialport.setup();
        await tester.mount(MockViewer);
        let vm = tester.wrapper.vm;
        
        // start the mocker
        await vm.start();
        await tester.msleep(100);
        expect(tester.store.getters.mocks[mock.id]).not.toBeUndefined();

        // stop the mocker
        await vm.stop();
        await tester.msleep(100);
        expect(tester.store.getters.mocks[mock.id]).toBeUndefined();
    })
});
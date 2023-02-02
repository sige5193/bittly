import MdbMock from '../../../../../models/MdbMock.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import MockerSetting from '../MockerSetting.vue'
describe('@/src/modules/mock/mockers/websocket/MockerSetting.vue', () => {
    it('basic', async () => {
        let tester = new Tester();
        await tester.setup();

        let mock = new MdbMock();
        mock.type = 'websocket';
        await mock.save();
        tester.prop('value', mock);

        await tester.mount(MockerSetting);
        await tester.wrapper.vm.open();
        await tester.msleep(100);

        await tester.wrapper.vm.actionOk();
        expect(mock.options.host).toBe('127.0.0.1');
    })
});
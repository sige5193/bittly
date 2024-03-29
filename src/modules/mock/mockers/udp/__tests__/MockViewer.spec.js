import MdbMock from '../../../../../models/MdbMock.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import MockViewer from '../MockViewer.vue'
import MockDgram from '../../../../directive/communicators/network/__tests__/mocks/MockDgram.js';
describe('@/src/modules/mock/mockers/udp/MockViewer.vue', () => {
    it('basic', async () => {
        let tester = new Tester();
        await tester.setup();

        let mock = new MdbMock();
        await mock.save();
        tester.prop('value', mock);

        let udp = MockDgram.setup();
        await tester.mount(MockViewer);
        let vm = tester.wrapper.vm;
        
        // start the mocker
        await vm.start();
        await tester.msleep(100);
        expect(tester.wrapper.vm.$store.getters.mocks[mock.id]).not.toBeUndefined();

        // stop the mocker
        await vm.stop();
        await tester.msleep(100);
        expect(tester.wrapper.vm.$store.getters.mocks[mock.id]).toBeUndefined();
    })
});
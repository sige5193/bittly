import MdbMock from '../../../../../models/MdbMock.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import MockViewer from '../MockViewer.vue'
import MockWebSocketServer from './mocks/MockWebSocketServer.js';
describe('@/src/modules/mock/mockers/websocket/MockViewer.vue', () => {
    it('basic', async () => {
        let tester = new Tester();
        await tester.setup();

        let mock = new MdbMock();
        await mock.save();
        tester.prop('value', mock);

        let server = MockWebSocketServer.setup();
        await tester.mount(MockViewer);
        let vm = tester.wrapper.vm;
        
        // start the mocker
        await vm.start();
        await tester.msleep(100);
        expect(tester.wrapper.vm.$store.getters.mocks[mock.id]).not.toBeUndefined();

        // a new client connected
        server.newClient({address:'127.0.0.1',port:'65535'});
        await tester.msleep(100);
        expect(tester.wrapper.findAllComponents('.tab-client-pane').length).toBe(1);

        // stop the mocker
        await vm.stop();
        await tester.msleep(100);
        expect(tester.wrapper.vm.$store.getters.mocks[mock.id]).toBeUndefined();
    })
});
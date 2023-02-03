import MdbMock from '../../../../../models/MdbMock.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import MockService from '../MockService.js'
import MockWebSocketServer from './mocks/MockWebSocketServer.js';
describe('@/src/modules/mock/mockers/websocket/Mocker.js', () => {
    it('basic', async () => {
        let tester = new Tester();
        await tester.setup();

        let mock = new MdbMock();
        await mock.save();
        
        let server = MockWebSocketServer.setup();
        let mocker = new MockService(mock);

        let clientNewEventHandler = jest.fn();
        mocker.on('client-new', clientNewEventHandler);

        // start server
        await mocker.start();
        expect(tester.store.getters.mocks[mock.id]).not.toBeUndefined();

        // new client
        server.newClient({address:'127.0.0.1',port:'8899'});
        await tester.msleep(200);
        expect(clientNewEventHandler).toBeCalled();
        expect(clientNewEventHandler.mock.calls[0][0].ws._socket.remoteAddress).toBe('127.0.0.1');

        // stop
        await mocker.stop();
        expect(tester.store.getters.mocks[mock.id]).toBeUndefined();
    })
});
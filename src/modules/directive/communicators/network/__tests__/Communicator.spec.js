import Tester from '../../../../../utils/test/UnitTester.js'
import MdbDirective from '@/models/MdbDirective.js';
import Communicator from '../Communicator.js'
import RequestParamBuilder from '../../../parameters/Builder.js';
import MockNetSocket from './mocks/MockNetSocket.js';
import MockDgram from './mocks/MockDgram.js';
describe('@/communicators/network/Communicator.js', () => {
    it('tcp', async ( done ) => {
        MockNetSocket.setup();

        let tester = new Tester();
        await tester.setup();
        await tester.activeNewProject();
        
        let directive = new MdbDirective();
        directive.projectId = tester.project.id;
        directive.target = {protocol : 'TCP',host : '127.0.0.1',port : '5566'};
        directive.requestFormat = 'text';
        directive.requestContent = {};
        directive.requestContent.text = 'TEST-CONTENT';

        let com = await Communicator.setup(directive.target);
        expect(com.getIsOpen()).toBeFalsy();
        await com.open();
        expect(com.getIsOpen()).toBeTruthy();
        await tester.msleep(100);
        expect(tester.wrapper.vm.$store.getters.communicators[com.comkey]).toBe(com);
        
        com.onData(async ( data ) => {
            data = data.toString();
            expect(data).toBe(directive.requestContent.text);
            expect(com.getDataReceiveSize()).toBe(directive.requestContent.text.length);
            await com.close();
            await tester.msleep(500);
            expect(tester.wrapper.vm.$store.getters.communicators[com.comkey]).toBeUndefined();
            done();
        });

        let paramBuilder = new RequestParamBuilder(directive);
        await paramBuilder.init();
        await com.write(paramBuilder.getRequestData());
        await tester.msleep(1000);
    })

    it('debug udp', async ( done ) => {
        MockDgram.setup();

        let tester = new Tester();
        await tester.setup();
        await tester.activeNewProject();
        
        let directive = new MdbDirective();
        directive.projectId = tester.project.id;
        directive.target = {protocol : 'UDP',host : '127.0.0.1',port : '5566',netUdpMode:'unicast'};
        directive.requestFormat = 'text';
        directive.requestContent = {};
        directive.requestContent.text = 'TEST-CONTENT';

        let com = await Communicator.setup(directive.target);
        expect(com.getIsOpen()).toBeFalsy();
        await com.open();
        await tester.msleep(100);
        expect(tester.wrapper.vm.$store.getters.communicators[com.comkey]).toBe(com);
        
        com.onData(async ( data ) => {
            data = data.toString();
            expect(data).toBe(directive.requestContent.text);
            expect(com.getDataReceiveSize()).toBe(directive.requestContent.text.length);
            await com.close();
            await tester.msleep(500);
            expect(tester.wrapper.vm.$store.getters.communicators[com.comkey]).toBeUndefined();
            done();
        });

        let paramBuilder = new RequestParamBuilder(directive);
        await paramBuilder.init();
        await com.write(paramBuilder.getRequestData());
        await tester.msleep(1000);
    })

    it('network failed', async () => {
        let tester = new Tester();
        await tester.setup();
        await tester.activeNewProject();

        tester.expectError(
            async () => await Communicator.setup({}), 
            'Please select network protocol'
        );
        tester.expectError(
            async () => await Communicator.setup({protocol:'TCP'}), 
            'Please input server host'
        );
        tester.expectError(
            async () => await Communicator.setup({protocol:'TCP',host:'127.0.0.1'}), 
            'Please input server port'
        );
        
        let socket = MockNetSocket.setup();
        let directive = new MdbDirective();
        directive.projectId = tester.project.id;
        directive.target = {protocol : 'TCP',host : '127.0.0.2',port : '5566'};
        directive.requestFormat = 'text';
        directive.requestContent = {};
        directive.requestContent.text = 'TEST-CONTENT';
        
        let com = await Communicator.setup(directive.target);
        
        // failed to connect
        socket.connect.mockImplementationOnce($this => socket.trigger($this, 'error', {message:'TEST-FAILED'}));
        tester.expectError(async() => await com.open(), 'TEST-FAILED');
    })
});
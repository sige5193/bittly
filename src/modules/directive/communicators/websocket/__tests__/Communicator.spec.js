import Tester from '../../../../../utils/test/UnitTester.js'
import MdbDirective from '@/models/MdbDirective.js';
import Communicator from '../Communicator.js'
import WS from "jest-websocket-mock";
import RequestParamBuilder from '../../../parameters/Builder.js';
describe('@/communicators/websocket/Communicator.js', () => {
    it('normal use', async ( done ) => {
        let server = new WS("ws://localhost:5566");
        let testContent = 'STRING-CONTENT';
        window.ws = {
            WebSocket : WebSocket
        };

        let tester = new Tester();
        await tester.setup();
        await tester.activeNewProject();

        let directive = new MdbDirective();
        directive.projectId = tester.project.id;
        directive.target = {wsUrl : 'ws://localhost:5566',wsHeaders:[{name:'xxx',value:'yyy'},{name:'',value:'yyy'}]};
        directive.requestFormat = 'text';
        directive.requestContent = {};
        directive.requestContent.text = testContent;

        let options = directive.target;
        let com = await Communicator.setup(options);
        expect(com.getIsOpen()).toBeFalsy();
        
        await com.open();
        await server.connected;
        expect(com.getIsOpen()).toBeTruthy();
        expect(tester.wrapper.vm.$store.getters.communicators[com.comkey]).toBe(com);
        
        com.onData(async ( data ) => {
            await expect(server).toReceiveMessage(Buffer.from(testContent));
            expect(data).toBe(testContent);
            expect(com.getDataReceiveSize()).toBe(testContent.length);
            await com.close();
            await tester.msleep(500);
            expect(tester.wrapper.vm.$store.getters.communicators[com.comkey]).toBeUndefined();
            server.close();
            done();
        });

        let paramBuilder = new RequestParamBuilder(directive);
        await paramBuilder.init();
        await com.write(paramBuilder.getRequestData());
        await tester.msleep(1000);
        server.send(testContent);
    })

    it('open failed', async () => {
        let directive = new MdbDirective();
        directive.target = {wsUrl : 'ws://localhost:55555'};

        let tester = new Tester();
        let com = await Communicator.setup(directive.target);
        expect(com.getIsOpen()).toBeFalsy();
        com.open().catch((e) => expect(e).toBe('Failed to connect to server ws://localhost:55555'));
        await tester.msleep(200);
    });

    it('connection error manually', async () => {
        let server = new WS("ws://localhost:5566");
        
        let directive = new MdbDirective();
        directive.target = {wsUrl : 'ws://localhost:5566'};

        let tester = new Tester();
        let com = await Communicator.setup(directive.target);
        expect(com.getIsOpen()).toBeFalsy();
        await com.open();
        await server.connected;
        
        // trigger error manulally
        com.connection.onerror('test error');
        await tester.msleep(200);
        expect(com.getIsOpen()).toBeFalsy();
        server.close();
    });
});
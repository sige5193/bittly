import Tester from '../../../../../utils/test/UnitTester.js'
import MdbDirective from '@/models/MdbDirective.js';
import Communicator from '../Communicator.js'
import RequestParamBuilder from '../../../parameters/Builder.js';
import MockNetSocket from './mocks/MockNetSocket.js';
import MockDgram from './mocks/MockDgram.js';
describe('@/communicators/network/Communicator.js', () => {
    it('tcp', async ( done ) => {
        let communicatorOnline = jest.fn();
        let communicatorOffline = jest.fn();
        let tester = new Tester({
            mockStoreCommits : {
                communicatorOnline,
                communicatorOffline,
            },
        });

        let mock = MockNetSocket.setup();
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
        expect(communicatorOnline).toBeCalled();
        expect(communicatorOnline.mock.calls[0][0].key).toBe(com.comkey);
        
        com.onData(async ( data ) => {
            data = data.toString();
            expect(data).toBe(directive.requestContent.text);
            expect(com.getDataReceiveSize()).toBe(directive.requestContent.text.length);
            await com.close();
            await tester.msleep(500);
            expect(communicatorOffline).toBeCalled();
            done();
        });

        let paramBuilder = new RequestParamBuilder(directive);
        await paramBuilder.init();
        await com.write(paramBuilder.getRequestData());
        await tester.msleep(1000);
    })

    it('udp', async ( done ) => {
        let communicatorOnline = jest.fn();
        let communicatorOffline = jest.fn();
        let tester = new Tester({
            mockStoreCommits : {
                communicatorOnline,
                communicatorOffline,
            },
        });
        MockDgram.setup();
        await tester.setup();
        await tester.activeNewProject();
        
        let directive = new MdbDirective();
        directive.projectId = tester.project.id;
        directive.target = {protocol : 'UDP',host : '127.0.0.1',port : '5566'};
        directive.requestFormat = 'text';
        directive.requestContent = {};
        directive.requestContent.text = 'TEST-CONTENT';

        let com = await Communicator.setup(directive.target);
        expect(com.getIsOpen()).toBeTruthy();
        await com.open();
        await tester.msleep(100);
        expect(communicatorOnline).toBeCalled();
        expect(communicatorOnline.mock.calls[0][0].key).toBe(com.comkey);
        
        com.onData(async ( data ) => {
            data = data.toString();
            expect(data).toBe(directive.requestContent.text);
            expect(com.getDataReceiveSize()).toBe(directive.requestContent.text.length);
            
            // nothing would happend
            com.connection.eventHandlers.error({code:'ECONNRESET'});

            await com.close();
            await tester.msleep(500);
            expect(communicatorOffline).toBeCalled();
            done();
        });

        let paramBuilder = new RequestParamBuilder(directive);
        await paramBuilder.init();
        await com.write(paramBuilder.getRequestData());
        await tester.msleep(1000);
    })

    it('network failed', async () => {
        let parameterErrorHandler = jest.fn(() => {});
        try {
            await Communicator.setup({});
        } catch ( e ) {
            parameterErrorHandler(e);
        } 
        expect(parameterErrorHandler.mock.calls[0][0].message).toBe('Please select network protocol');
       
        try {
            await Communicator.setup({protocol:'TCP'});
        } catch ( e ) {
            parameterErrorHandler(e);
        } 
        expect(parameterErrorHandler.mock.calls[1][0].message).toBe('Please input server host');

        try {
            await Communicator.setup({protocol:'TCP',host:'127.0.0.1'});
        } catch ( e ) {
            parameterErrorHandler(e);
        } 
        expect(parameterErrorHandler.mock.calls[2][0].message).toBe('Please input server port');
        
        /** overide network class */
        let socketConnect = jest.fn(($this,callback) => callback());
        window.net = {};
        window.net.Socket = class {
            constructor () {
                this.eventHandlers = {};
            }
            on( event, handler ) {
                this.eventHandlers[event] = handler;
            }
            connect(options, callback) {
                socketConnect(this, callback);
            }
            write( data, callback ) {
                let $this = this;
                setTimeout(() => {
                    $this.eventHandlers.data(data);
                }, 100);
                callback();
            }
            end() {
                let $this = this;
                setTimeout(function() {
                    $this.isOpen = false;
                    $this.eventHandlers.close(true);
                }, 200);
            }
            destroy() {}
        };

        let communicatorOnline = jest.fn();
        let communicatorOffline = jest.fn();
        let tester = new Tester({
            mockStoreCommits : {
                communicatorOnline,
                communicatorOffline,
            },
        });
        await tester.setup();
        await tester.activeNewProject();
        
        let directive = new MdbDirective();
        directive.projectId = tester.project.id;
        directive.target = {protocol : 'TCP',host : '127.0.0.2',port : '5566'};
        directive.requestFormat = 'text';
        directive.requestContent = {};
        directive.requestContent.text = 'TEST-CONTENT';
        
        let com = await Communicator.setup(directive.target);
        await com.close();
        await tester.msleep(1000);

        // on error event
        let onErrorCallbackHandler = jest.fn(() => {});
        // error on open
        socketConnect.mockImplementationOnce(($this,callback) => { 
            $this.eventHandlers.error({open:'TEST-FAILED'})
        });
        try {
            await com.open();
        } catch ( e ) {
            onErrorCallbackHandler(e);
        }
        expect(onErrorCallbackHandler.mock.calls[0][0].open).toBe('TEST-FAILED');
        await com.open();

        try {
            com.connection.eventHandlers.error({message:'TEST'});
        } catch ( e ) {
            onErrorCallbackHandler(e);
        }
        expect(onErrorCallbackHandler.mock.calls[1][0].message).toBe('TEST');
        
        // nothing would happend
        com.connection.eventHandlers.error({code:'ECONNRESET'});

        await com.close();
        await tester.msleep(1000);
    })
});
import TestcaseSetup from '../../../../utils/test/Setup.js';
import ResponseHandler from '../ResponseHandler.vue'
describe('@/src/tools/utils/mock-server/ResponseHandler.vue', () => {
    it('manual - text', async ( done ) => {
        let setup = new TestcaseSetup();
        setup.componentSetProp('enable',true);
        setup.componentSetProp('toolOptions', {
            responseHandler : 'manual',
            responseMode : 'text',
        });
        setup.componentOn('response-generated', ( data ) => {
            expect(data.mode).toBe('text');
            expect(data.content).toBe('hello');
            done();
        });
        await setup.setup();

        let wrapper = await setup.mount(ResponseHandler);
        await setup.msleep(500);
        
        let textContent = wrapper.findComponent({ref:'textareaManualContent'});
        textContent.find('textarea').setValue('hello');
        await setup.comButtonClick(wrapper, 'btnManualSend');
    })

    it('echo', async ( done ) => {
        let setup = new TestcaseSetup();
        setup.componentSetProp('enable',true);
        setup.componentSetProp('toolOptions', {
            responseHandlers : [{type:'echo',enable:true,label:'ECHO'}],
        });
        setup.componentOn('response-generated', ( data ) => {
            expect(data.clientKey).toBe('client-key');
            expect(data.mode).toBe('hex');
            expect(data.content).toBe('68656C6C6F');
            done();
        });
        await setup.setup();

        let wrapper = await setup.mount(ResponseHandler);
        await setup.msleep(500);
        wrapper.vm.setRequestData('client-key', Buffer.from('hello'));
    })

    it('random', async ( done ) => {
        let setup = new TestcaseSetup();
        setup.componentSetProp('enable',true);
        setup.componentSetProp('toolOptions', {
            responseHandlers : [{type:'random',enable:true,label:'random'}],
            responseMode : 'text',
            responseRandomTemplate : '{{n}}:{{a}}:{{A}}:{{hex}}:{{internet.ip}}',
        });
        setup.componentOn('response-generated', ( data ) => {
            expect(data.clientKey).toBe('client-key');
            expect(data.mode).toBe('text');
            expect(data.content).toMatch(/\d:[a-z]:[A-Z]:[A-F0-9]:\d+\.\d+\.\d+\.\d+/);
            done();
        });
        await setup.setup();

        let wrapper = await setup.mount(ResponseHandler);
        await setup.msleep(500);
        wrapper.vm.setRequestData('client-key', Buffer.from('hello'));
    })

    it('script', async ( done ) => {
        let setup = new TestcaseSetup();
        setup.componentSetProp('enable',true);
        setup.componentSetProp('toolOptions', {
            responseHandler : 'script',
            responseHandlers : [{type:'script',enable:true,label:'script'}],
            responseMode : 'text',
            responseScript : '$this.responseText("HELLO")',
        });
        setup.componentOn('response-generated', ( data ) => {
            expect(data.clientKey).toBe('client-key');
            expect(data.mode).toBe('text');
            expect(data.content).toBe('HELLO');
            done();
        });
        await setup.setup();

        let wrapper = await setup.mount(ResponseHandler, true);
        await setup.msleep(500);
        wrapper.vm.setRequestData('client-key', Buffer.from('hello'));
    })

    it('match', async ( done ) => {
        let setup = new TestcaseSetup();
        setup.componentSetProp('enable',true);
        setup.componentSetProp('charset','utf8');
        setup.componentSetProp('toolOptions', {
            responseHandler : 'match',
            responseHandlers : [{type:'match',enable:true,label:'match'}],
            responseMatchRules : [
                {enable:true,mode:'text',template:'how are you', response:'{{internet.ip}}'},
            ],
        });
        setup.componentOn('response-generated', ( data ) => {
            expect(data.clientKey).toBe('client-key');
            expect(data.mode).toBe('text');
            expect(data.content).toMatch(/\d+\.\d+\.\d+\.\d+/);
            done();
        });
        await setup.setup();

        let wrapper = await setup.mount(ResponseHandler, true);
        await setup.msleep(500);
        wrapper.vm.setRequestData('client-key', Buffer.from('how are you'));
    })

    it('execute response flow : match > script > random > echo', async ( done ) => {
        let setup = new TestcaseSetup();
        setup.componentSetProp('enable',true);
        setup.componentSetProp('charset','utf8');
        setup.componentSetProp('toolOptions', {
            responseHandler : 'match',
            responseMode : 'text',
            responseHandlers : [
                {type:'match',enable:true,label:'match'},
                {type:'script',enable:true,label:'script'},
                {type:'random',enable:true,label:'random'},
                {type:'echo',enable:true,label:'ECHO'}
            ],
            responseMatchRules : [
                {enable:true,mode:'text',template:'how are you', response:'{{internet.ip}}'},
            ],
            responseScript : '$this.responseText("HELLO")',
            responseRandomTemplate : '{{n}}:{{a}}:{{A}}:{{hex}}:{{internet.ip}}',
        });

        let responseCounter = 0;
        setup.componentOn('response-generated', ( data ) => {
            expect(data.clientKey).toBe('client-key');
            responseCounter ++;
            switch ( responseCounter ) {
            case 1 : expect(data.content).toMatch(/\d+\.\d+\.\d+\.\d+/); break;
            case 2 : expect(data.content).toBe('HELLO'); break;
            case 3 : expect(data.content).toMatch(/\d:[a-z]:[A-Z]:[A-F0-9]:\d+\.\d+\.\d+\.\d+/); break;
            case 4 : expect(data.content).toBe('686F772061726520796F75'); done(); break;
            }
        });
        await setup.setup();

        let wrapper = await setup.mount(ResponseHandler, true);
        await setup.msleep(500);
        wrapper.vm.setRequestData('client-key', Buffer.from('how are you'));
    }, 10000)
});
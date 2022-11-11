import UnitTester from '../../utils/test/UnitTester.js';
import AppFeedback from '../AppFeedback.vue'
import MdbRuntimeVariable from '../../models/MdbRuntimeVariable.js'
describe('@/components/AppFeedback.vue', () => {
    it('basic', async ( ) => {
       let tester = new UnitTester({
            mockBittlyApiClient : {
                feedbackSend( message ) {
                    expect(message.content).toBe('HELLO');
                    return {
                        success : true,
                        data : {sid:'SID'}
                    };
                },
                feedbackPull( sid ) {
                    expect(sid).toBe('SID');
                    return {
                        success : true,
                        data : [
                            {created_at:'2011-11-11',content:'WORLD',type:'text',source:'bittly'}
                        ],
                    };
                },
            },
        });
        await tester.setup();

        MdbRuntimeVariable.setVarValue('feedback_messages', JSON.stringify([
            {source:'bittly',type:'text',content:'HELLO',time:'2022',created_at:'2022-12-12'}
        ]));
        await tester.mount(AppFeedback);
        await tester.eventBusEmit('menu-help-feedback-clicked');
        await tester.msleep(200);

        await tester.click({ref:'iconMessage'});
        await tester.textareaInput({ref:'txtMessage'},'HELLO');
        await tester.emit({ref:'txtMessage'}, 'pressEnter',[{preventDefault:()=>{}}]);
        await tester.msleep(1000);

        expect(tester.text('.message-content-user')).toBe('HELLO');
        
        let bittlyMessages = tester.wrapper.findAll('.message-content-bittly');
        expect(bittlyMessages.at(0).text()).toBe('HELLO');
        expect(bittlyMessages.at(1).text()).toBe('WORLD');

        await tester.emit({ref:'modalChat'}, 'cancel');
        await tester.msleep(200);
        tester.wrapper.destroy();
    }, 10 * 1000);

    it('send image', async () => {
        let sendMessage = null;
        window.dialog = {};
        window.fs = {};

        let tester = new UnitTester({
            mockBittlyApiClient : {
                feedbackSend( message ) {
                    sendMessage = message;
                    return {success : true, data : {sid:'SID'}};
                },
                feedbackPull( sid ) {
                    return { success : true, data : []};
                },
            },
        });
        await tester.setup();
        await tester.mount(AppFeedback);
        await tester.msleep(200);
        await tester.eventBusEmit('menu-help-feedback-clicked');
        await tester.msleep(200);

        await tester.click({ref:'iconMessage'});

        sendMessage = null;
        window.dialog.showOpenDialogSync = () => undefined;
        await tester.click({ref:'btnSendImg'});
        await tester.msleep(100);
        expect(sendMessage).toBe(null);
        
        window.dialog.showOpenDialogSync = () => 'TEST-IMAGE-PATH';
        window.fs.readFile = (path, callback) => callback('TEST-ERROR', null);
        await tester.click({ref:'btnSendImg'});
        await tester.msleep(100);
        expect(sendMessage).toBe(null);
        
        window.dialog.showOpenDialogSync = () => 'TEST-IMAGE-PATH';
        window.fs.readFile = (path, callback) => callback(undefined, {toString:()=>'TEST-IMAGE'});
        await tester.click({ref:'btnSendImg'});
        await tester.msleep(100);
        expect(sendMessage.content).toBe('TEST-IMAGE');
        tester.wrapper.destroy();
    })

    it('send messages', async () => {
        let sendMessage = null;
        let sendResult = {success : true, data : {sid:'SID'}};
        let pullResult = {success : false, data : []};

        let tester = new UnitTester({
            props : {
                messageLimit : 1,
            },
            mockBittlyApiClient : {
                feedbackSend( message ) {
                    sendMessage = message;
                    return sendResult;
                },
                feedbackPull( sid ) {
                    return pullResult;
                },
            },
        });
        await tester.setup();
        await tester.mount(AppFeedback);
        await tester.msleep(200);
        await tester.eventBusEmit('menu-help-feedback-clicked');
        await tester.msleep(200);

        // send empty message
        await tester.textareaInput({ref:'txtMessage'},'');
        await tester.emit({ref:'txtMessage'}, 'pressEnter',[{preventDefault:()=>{}}]);
        await tester.msleep(200);
        expect(sendMessage).toBe(null);
        expect(tester.wrapper.findAll('.message-content-user').length).toBe(0);

        // send failed
        sendResult = {success : false, data : null};
        await tester.textareaInput({ref:'txtMessage'},'HELLO');
        await tester.emit({ref:'txtMessage'}, 'pressEnter',[{preventDefault:()=>{}}]);
        await tester.msleep(200);
        expect(sendMessage.content).toBe('HELLO');
        expect(tester.wrapper.findAll('.message-content-user').length).toBe(0);

        // send 2 message but only last one would be displayed
        sendResult = {success : true, data : {sid:'SID'}};
        await tester.textareaInput({ref:'txtMessage'},'HELLO');
        await tester.emit({ref:'txtMessage'}, 'pressEnter',[{preventDefault:()=>{}}]);
        await tester.msleep(200);
        await tester.textareaInput({ref:'txtMessage'},'HELLO2');
        await tester.emit({ref:'txtMessage'}, 'pressEnter',[{preventDefault:()=>{}}]);
        expect(tester.wrapper.findAll('.message-content-user').length).toBe(1);
        expect(tester.wrapper.findAll('.message-content-user').at(0).text()).toBe('HELLO2');
        await tester.msleep(2000);
        tester.wrapper.destroy();
    })

    it('pull messages', async () => {
        let sendMessage = null;
        let sendResult = {success : true, data : {sid:'SID'}};
        let pullResult = {success : true, data : []};

        let tester = new UnitTester({
            props : {
                messageLimit : 2,
                bgPullFrequencyDefault : 100,
            },
            mockBittlyApiClient : {
                feedbackSend( message ) {
                    sendMessage = message;
                    return sendResult;
                },
                feedbackPull( sid ) {
                    return pullResult;
                },
            },
        });
        await tester.setup();
        await tester.mount(AppFeedback);
        await tester.msleep(200);
        await tester.eventBusEmit('menu-help-feedback-clicked');
        await tester.msleep(200);

        // send 1 message
        await tester.textareaInput({ref:'txtMessage'},'HELLO');
        await tester.emit({ref:'txtMessage'}, 'pressEnter',[{preventDefault:()=>{}}]);
        await tester.msleep(200);
        await tester.emit({ref:'modalChat'}, 'cancel');
        await tester.msleep(200);

        // normal pulling
        pullResult = {success : true, data : [{source:'bittly',type:'text',content:'HELLO',time:'2022',created_at:'2022-12-12'}]};
        await tester.msleep(500);

        // open chat dialog and check
        await tester.eventBusEmit('menu-help-feedback-clicked');
        await tester.msleep(200);
        expect(tester.wrapper.findAll('.message-content-bittly').length).toBeGreaterThanOrEqual(2);
        
        // empty result
        pullResult = {success : true, data : []};
        await tester.emit({ref:'modalChat'}, 'cancel');
        await tester.msleep(2000);
        expect(tester.dataGet('bgPullFrequency')).toBeGreaterThanOrEqual(200);

        // pull failed
        pullResult = {success : false, data : []};
        await tester.msleep(500);
        expect(tester.dataGet('bgPullTimer')).toBe(null);
        tester.wrapper.destroy();
    }, 20000)
});
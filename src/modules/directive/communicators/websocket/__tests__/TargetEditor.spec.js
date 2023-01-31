import Tester from '../../../../../utils/test/UnitTester.js';
import TargetEditor from '../TargetEditor.vue'
describe('@/communicators/websocket/TargetEditor.vue', () => {
    it('normal use', async ( ) => {
        let target = {
            wsUrl : 'ws://example.com',
        };
        
        let targetInput = jest.fn(( newTarget ) => {
            target = newTarget;
        });
        let tester = new Tester({
            props : {
                value : target,
            },
            listeners : {
                input : targetInput,
            },
            mockStoreGetters : {
                communicators : {},
            }
        });
        await tester.setup();
        await tester.mount(TargetEditor);

        await tester.input({ref:'txtUrl'}, 'ws://localhost:8899/demo');
        let url = targetInput.mock.calls[1][0].wsUrl;
        expect(url).toBe('ws://localhost:8899/demo');
        expect(tester.wrapper.vm.getComKeyByOptions({wsUrl:url})).toBe('WebSocket:ws://localhost:8899/demo');
        expect(TargetEditor.editorConfig().name).toBe('Websocket');
    
        // open setting modal
        await tester.emit({ref:'btnSetting'},'click');
        await tester.input({ref:'txtHeaderName_0'},'HeaderName000');
        await tester.input({ref:'txtHeaderValue_0'},'HeaderValue000');
        expect(target.wsHeaders[0].name).toBe('HeaderName000');
        expect(target.wsHeaders[0].value).toBe('HeaderValue000');
        await tester.trigger({ref:'btnHeaderDelete_0'}, 'click');
        await tester.trigger({ref:'btnHeaderDelete_0'}, 'click');
        expect(target.wsHeaders[0].name).toBe('');
        expect(target.wsHeaders[0].value).toBe('');
    })
});
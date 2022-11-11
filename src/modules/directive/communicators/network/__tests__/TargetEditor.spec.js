import Tester from '../../../../../utils/test/UnitTester.js'
import TargetEditor from '../TargetEditor.vue'
describe('@/communicators/network/TargetEditor.vue', () => {
    it('normal use', async ( ) => {
        let target = {};
        let tester = new Tester({
            props : {
                value : target,
            },
            listeners : {
                input : ( newTarget ) => {
                    target = newTarget;
                }
            },
            mockStoreGetters : {
                communicators : {}
            }
        });
        await tester.setup();
        await tester.mount(TargetEditor);
        await tester.select({ref:'protocol'}, 'UDP');
        await tester.input({ref:'host'},'127.0.0.1');
        await tester.input({ref:'port'},'8899');
        expect(target.protocol).toBe('UDP');
        expect(target.host).toBe('127.0.0.1');
        expect(target.port).toBe('8899');
        expect(tester.wrapper.vm.getComKeyByOptions(target)).toBe('Network:UDP:127.0.0.1:8899');
        
        let editorConfig = TargetEditor.editorConfig();
        expect(editorConfig.name).toBe('Network');
        expect(editorConfig.defaultDataType).toBe('byte');
        expect(editorConfig.defaultResponseViewer).toBe('hex');
    })
});
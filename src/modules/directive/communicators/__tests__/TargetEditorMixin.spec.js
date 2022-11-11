import Tester from '../../../../utils/test/UnitTester.js'
import TargetEditorMixin from '../TargetEditorMixin.js'
describe('@/communicators/TargetEditorMixin.js', () => {
    it('basic', async () => {
        let componment = {
            name : 'Test',
            template : '<div>HELLO</div>',
            mixins : [TargetEditorMixin],
            mounted() {
                this.isEditorInited = true;
            },
            methods : {
                getComKeyByOptions() {
                    return 'test-com';
                }
            }
        };
        
        let parameterEditorEnableChange = jest.fn();
        let communicatorClose = jest.fn().mockResolvedValue(true);
        let tester = new Tester({
            mockStoreGetters : {
                communicators : {
                    'test-com' : {
                        close : communicatorClose,
                    }
                }
            },
            listeners : {
                'parameter-editor-enable-change' : parameterEditorEnableChange,
            }
        });
        await tester.setup();
        await tester.mount(componment);
        tester.wrapper.vm.actionForceUpdate();
        expect(tester.wrapper.vm.getComKeyByOptions()).toBe('test-com');

        tester.wrapper.setProps({value:{name:'test'}});
        await tester.msleep(200);
        expect(tester.dataGet('target').name).toBe('test');

        tester.wrapper.vm.parameterEditorEnable(true);
        
        expect(parameterEditorEnableChange.mock.calls[0][0]).toBeTruthy();

        tester.wrapper.vm.actionUpdateTarget(true);
        await tester.msleep(200);
        expect(communicatorClose).toBeCalled();
    })

    it('cover getComKeyByOptions', async() => {
        let componment = {
            name : 'Test',
            template : '<div>HELLO</div>',
            mixins : [TargetEditorMixin],
            mounted() {
                this.isEditorInited = true;
            },
        };
        
        let tester = new Tester({});
        await tester.setup();
        await tester.mount(componment);
        expect(tester.wrapper.vm.getComKeyByOptions()).toBe(null);
    })
});
import Tester from '../../../../../utils/test/UnitTester.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/number-input/Edit.vue', () => {
    it('normal use', async () => {
        let panel = {
            variables : [
                {name : 'VAR_01',}
            ],
        };
        let widget = {};

        let tester = new Tester({
            props : {
                value : widget,
                panel : panel,
            },
            listeners : {
                input : newValue => widget = newValue
            }
        });
        await tester.setup();
        let wrapper = await tester.mount(Edit);
        wrapper.vm.setting();
        await tester.msleep(100);
        
        await tester.input({ref:'inputPrefix'}, 'PREFIX');
        await tester.input({ref:'inputSuffix'}, 'SUFFIX');
        await tester.radioGroupSelect({ref:'radioGroupSizeMode'}, 'small');

        await wrapper.vm.$refs.setting.actionSettingOk();
        await tester.msleep(100);

        expect(widget.prefix).toBe('PREFIX');
        expect(widget.suffix).toBe('SUFFIX');
        expect(widget.sizeMode).toBe('small');

        expect(Edit.widgetInfo().name).toBe('number-viewer');
    })
});
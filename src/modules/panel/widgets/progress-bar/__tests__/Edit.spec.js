import Tester from '../../../../../utils/test/UnitTester.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/progress-bar/Edit.vue', () => {
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

        let inputMinValue = wrapper.findComponent({ref:'inputMinValue'}).find('input');
        await inputMinValue.setValue('100');

        let inputMaxValue = wrapper.findComponent({ref:'inputMaxValue'}).find('input');
        await inputMaxValue.setValue('1000');

        await wrapper.vm.$refs.setting.actionSettingOk();
        await tester.msleep(100);

        expect(widget.minValue).toBe('100');
        expect(widget.maxValue).toBe('1000');

        expect(Edit.widgetInfo().name).toBe('progress-bar');
    })
});
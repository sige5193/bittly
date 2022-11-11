import Tester from '../../../../../utils/test/UnitTester.js'
import Edit from '../Edit.vue'
import Common from '@/utils/Common.js'
describe('@/modules/panel/widgets/thermometer/Edit.vue', () => {
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
                input : newValue => widget = newValue,
            }
        });
        await tester.setup();
        let wrapper = await tester.mount(Edit);

        wrapper.vm.setting();
        await Common.msleep(100);

        await tester.input({ref:'inputMinValue'}, '100');
        await tester.input({ref:'inputMaxValue'}, '1000');
        await tester.input({ref:'inputTickCount'}, '10');
        await wrapper.vm.$refs.setting.actionSettingOk();
        await Common.msleep(100);

        expect(widget.minValue).toBe('100');
        expect(widget.maxValue).toBe('1000');
        expect(widget.tickCount).toBe('10');

        expect(Edit.widgetInfo().name).toBe('thermometer');
    })
});
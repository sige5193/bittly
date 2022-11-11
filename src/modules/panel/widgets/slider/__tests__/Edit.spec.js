import MdbPanel from '../../../../../models/MdbPanel.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/slider/Edit.vue', () => {
    it('normal use', async () => {
        let panel = new MdbPanel();
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

        await tester.input({ref:'inputDefaultValue'},'500');
        await tester.input({ref:'inputMinValue'},'100');
        await tester.input({ref:'inputMaxValue'},'1000');

        await wrapper.vm.$refs.setting.actionSettingOk();
        await tester.msleep(100);

        expect(widget.defaultValue).toBe(500);
        expect(widget.minValue).toBe(100);
        expect(widget.maxValue).toBe(1000);

        expect(Edit.widgetInfo().name).toBe('slider');
    })
});
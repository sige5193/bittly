import MdbPanel from '../../../../../models/MdbPanel.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/number-input/Edit.vue', () => {
    it('normal use', async () => {
        let panel = new MdbPanel();
        let widget = {};

        let tester = new Tester({
            props : {
                value : widget,
                panel : panel
            },
            listeners : {
                input : newValue => widget = newValue
            }
        });
        await tester.setup();
        let wrapper = await tester.mount(Edit);
        
        wrapper.vm.setting();
        await tester.msleep(100);

        await tester.input({ref:'inputDefaultValue'}, '33');
        await tester.input({ref:'inputMinValue'}, '10');
        await tester.input({ref:'inputMaxValue'}, '66');
        await tester.input({ref:'inputStepValue'}, '3');
        await tester.radioGroupSelect({ref:'radioGroupSizeMode'}, 'large');
        
        await wrapper.vm.$refs.setting.actionSettingOk();
        await tester.msleep(100);

        expect(widget.defaultValue).toBe(33);
        expect(widget.minValue).toBe(10);
        expect(widget.maxValue).toBe(66);
        expect(widget.stepValue).toBe(3);
        expect(widget.sizeMode).toBe('large');

        expect(Edit.widgetInfo().name).toBe('number');
    })
});
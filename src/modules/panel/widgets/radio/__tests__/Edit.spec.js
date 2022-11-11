import MdbPanel from '../../../../../models/MdbPanel.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/radio/Edit.vue', () => {
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

        await tester.input({ref:'inputDefaultValue'}, 'VAL_1');
        await tester.click({ref:'btnRadioOptionDelete'},null,0);
        await tester.click({ref:'btnRadioOptionDelete'},null,0);
        await tester.click({ref:'btnRadioOptionDelete'},null,0);
        await tester.input({ref:'inputRadioOptionName'}, 'NEW_VALUE', null, 0);
        await tester.input({ref:'inputRadioOptionValue'}, 'VAL_1', null, 0);

        await wrapper.vm.$refs.setting.actionSettingOk();
        await tester.msleep(100);

        expect(widget.defaultValue).toBe('VAL_1');
        expect(widget.options.length).toBe(1);
        expect(widget.options[0].name).toBe('NEW_VALUE');
        expect(widget.options[0].value).toBe('VAL_1');
        
        expect(Edit.widgetInfo().name).toBe('radio');
    })
});
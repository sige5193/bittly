import MdbPanel from '../../../../../models/MdbPanel.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/label/Edit.vue', () => {
    it('normal use', async () => {
        let panel = new MdbPanel();
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
        await tester.msleep(100);
        
        let inputLabel = wrapper.findComponent({ref:'inputLabel'}).find('input');
        await inputLabel.setValue('LABEL');

        await wrapper.vm.$refs.setting.actionSettingOk();
        await tester.msleep(100);

        expect(widget.text).toBe('LABEL');
        expect(Edit.widgetInfo().name).toBe('label');
    })
});
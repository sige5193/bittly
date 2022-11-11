import MdbPanel from '../../../../../models/MdbPanel.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/button/Edit.vue', () => {
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

        await tester.input({ref:'inputLabel'}, 'TEST');
        await tester.select({ref:'selectIcon'}, 'login');
        await tester.input({ref:'inputConfirmMessage'}, 'CONFIRM-MESSAGE');

        await wrapper.vm.$refs.setting.actionSettingOk();
        await tester.msleep(100);

        expect(widget.label).toBe('TEST');
        expect(widget.icon).toBe('login');
        expect(widget.confirmMessage).toBe('CONFIRM-MESSAGE');

        expect(Edit.widgetInfo().name).toBe('button');
    })
});
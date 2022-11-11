import MdbPanel from '../../../../../models/MdbPanel.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/switch/Edit.vue', () => {
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

        await tester.emit({ref:'switchInitStatus'}, 'change', [true]);
        await tester.input({ref:'inputValueOn'}, 'X-ON');
        await tester.input({ref:'inputValueOff'}, 'X-OFF');

        await wrapper.vm.$refs.setting.actionSettingOk();
        await tester.msleep(100);

        expect(widget.initStatus).toBeTruthy();
        expect(widget.valueOn).toBe('X-ON');
        expect(widget.valueOff).toBe('X-OFF');

        expect(Edit.widgetInfo().name).toBe('switch');
    })
});
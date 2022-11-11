import MdbPanel from '../../../../models/MdbPanel.js';
import Tester from '../../../../utils/test/UnitTester.js'
import WidgetEditMixin from '../WidgetEditMixin.js'
describe('@/src/modules/panel/widgets/WidgetEditMixin.js', () => {
    it('basic', async () => {
        let panel = new MdbPanel();
        let widget = {};
        let com = {
            name : 'TestWidget',
            mixins : [WidgetEditMixin],
            template : '<div>HELLO</div>',
        };
        
        let panelChange = jest.fn();
        let tester = new Tester({
            props : {
                value : {},
                panel : panel,
            },
            listeners : {
                input : newValue => widget = newValue,
                'panel-change' : panelChange,
            }
        });
        await tester.setup();
        let wrapper = await tester.mount(com);
        wrapper.setProps({value:widget});
        wrapper.vm.actionUpdateVModel();

        // setting
        let settingOpen = jest.fn(() => Promise.resolve(false));
        wrapper.vm.$refs.setting = {open:settingOpen};
        await wrapper.vm.setting();
        await tester.msleep(100);
        expect(panelChange).not.toBeCalled();

        settingOpen.mockImplementationOnce(() => Promise.resolve(true));
        await wrapper.vm.setting();
        await tester.msleep(100);
        expect(panelChange).toBeCalled();
    });
});
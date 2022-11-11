import Edit from '../Edit.vue'
import WidgetTestHelper from '../../WidgetTestHelper.js'
describe('@/modules/panel/widgets/led/Edit.vue', () => {
    it('normal use', async () => {
        let env = await WidgetTestHelper.setupEnvForEdit();
        await env.tester.mount(Edit);
        
        await env.settingStart();
        await env.tester.radioGroupSelect({ref:'radioGroupColor'}, 'blue');
        await env.settingOk();

        expect(env.widget.color).toBe('blue');
        expect(Edit.widgetInfo().name).toBe('led');
    })
});
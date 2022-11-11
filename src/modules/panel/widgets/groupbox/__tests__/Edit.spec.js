import WidgetTestHelper from '../../WidgetTestHelper.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/groupbox/Edit.vue', () => {
    it('basic', async () => {
        let env = await WidgetTestHelper.setupEnvForEdit();
        await env.tester.mount(Edit);
        
        await env.settingStart();
        await env.tester.input({ref:'inputTitle'}, 'GB');
        await env.settingOk();
        
        expect(env.widget.title).toBe('GB');
        expect(Edit.widgetInfo().name).toBe('groupbox');
    })
});
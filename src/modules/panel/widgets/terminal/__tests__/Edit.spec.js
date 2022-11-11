import WidgetTestHelper from '../../WidgetTestHelper.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/terminal/Edit.vue', () => {
    it('basic', async () => {
        let env = await WidgetTestHelper.setupEnvForEdit();
        await env.tester.mount(Edit);

        await env.settingStart();
        await env.tester.emit({ref:'varSelectorSourceVar'}, 'input', ['VAR_01']);
        await env.settingOk();

        expect(env.widget.sourceVariable).toBe('VAR_01');
        expect(Edit.widgetInfo().name).toBe('terminal');
    })
});
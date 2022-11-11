import WidgetTestHelper from '../../WidgetTestHelper.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/timer/Edit.vue', () => {
    it('basic', async () => {
        let env = await WidgetTestHelper.setupEnvForEdit();
        await env.tester.mount(Edit);
        
        await env.settingStart();

        await env.tester.input({ref:'inputInterval'}, '5');
        await env.tester.input({ref:'inputCount'}, '10');
        await env.settingOk();

        expect(env.widget.interval).toBe(5);
        expect(env.widget.count).toBe(10);

        expect(Edit.widgetInfo().name).toBe('timer');
    })
});
import WidgetTestHelper from '../../WidgetTestHelper.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/liquidfill/Edit.vue', () => {
    it('basic', async () => {
        let env = await WidgetTestHelper.setupEnvForEdit();
        await env.tester.mount(Edit);

        await env.settingStart();
        await env.tester.input({ref:'inputMinValue'}, '100');
        await env.tester.input({ref:'inputMaxValue'}, '1000');
        await env.settingOk();

        expect(env.widget.minValue).toBe(100);
        expect(env.widget.maxValue).toBe(1000);
        env.tester.wrapper.destroy();

        expect(Edit.widgetInfo().name).toBe('liquidfill');
    })
});
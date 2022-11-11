import Edit from '../Edit.vue'
import WidgetTestHelper from '../../WidgetTestHelper.js';
describe('@/modules/panel/widgets/gauge/Edit.vue', () => {
    it('normal use', async () => {
        let env = await WidgetTestHelper.setupEnvForEdit();
        let wrapper = await env.tester.mount(Edit);
        wrapper.vm.setting();
        await env.tester.msleep(100);

        await env.tester.input({ref:'inputMinValue'}, '100');
        await env.tester.input({ref:'inputMaxValue'}, '1000');
        await wrapper.vm.$refs.setting.actionSettingOk();
        await env.tester.msleep(100);

        expect(env.widget.minValue).toBe('100');
        expect(env.widget.maxValue).toBe('1000');

        expect(Edit.widgetInfo().name).toBe('gauge');

        wrapper.destroy();
    })
});
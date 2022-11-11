import WidgetTestHelper from '../../WidgetTestHelper.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/line-chart/Edit.vue', () => {
    it('normal use', async () => {
        let env = await WidgetTestHelper.setupEnvForEdit();
        let wrapper = await env.tester.mount(Edit);

        await env.settingStart();
        await env.tester.input({ref:'inputTitle'}, 'TITLE');
        await env.tester.input({ref:'inputMaxDataLength'}, '9999');
        await env.tester.emit({ref:'variableSelectorWatchVariable'}, 'input', ['VAR_01']);
        await env.tester.input({ref:'inputDataExpression'},'{{VAR_01}}');
        await env.settingOk();

        expect(env.widget.title).toBe('TITLE');
        expect(env.widget.maxDataLength).toBe(9999);
        expect(env.widget.watchVariable).toBe('VAR_01');
        expect(env.widget.dataExpression).toBe('{{VAR_01}}');
        wrapper.destroy();

        expect(Edit.widgetInfo().name).toBe('line-chart');
    })
});
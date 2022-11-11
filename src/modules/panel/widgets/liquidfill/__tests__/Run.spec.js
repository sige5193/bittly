import WidgetTestHelper from '../../WidgetTestHelper.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/liquidfill/Run.vue', () => {
    it('normal use', async () => {
        let widget = {
            minValue : 0,
            maxValue : 100,
            dataSource : 'variable',
            sourceVariable : 'VAR01',
        };
        let env = await WidgetTestHelper.setupEnvForRunning(widget);
        let wrapper = await env.tester.mount(Run);

        await env.widgetRefresh();
        expect(wrapper.vm.$data.value).toBe('33');

        env.runtime.setVariableValue('VAR01', -100);
        await env.widgetRefresh();
        expect(wrapper.vm.$data.value).toBe(-100);
        env.runtime.setVariableValue('VAR01', 1000);
        await env.widgetRefresh();
        expect(wrapper.vm.$data.value).toBe(1000);

        env.runtime.setVariableValue('VAR01', 'XXX');
        await env.widgetRefresh();
        expect(wrapper.vm.$data.value).toBe('XXX');

        // data source : expression
        widget.dataSource = 'expression';
        widget.sourceExpression = '{{VAR01}}';
        env.runtime.setVariableValue('VAR01', '33');
        await env.widgetRefresh();
        expect(wrapper.vm.$data.value).toBe(33);

        wrapper.destroy();
    })
});
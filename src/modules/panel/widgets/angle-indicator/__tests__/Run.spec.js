import WidgetTestHelper from '../../WidgetTestHelper.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/angle-indicator/Run.vue', () => {
    it('basic', async () => {
        let widget = {
            minValue : 0,
            maxValue : 100,
            dataSource : 'variable',
            sourceVariable : 'VAR01',
        };
        let env = await WidgetTestHelper.setupEnvForRunning(widget);
        let wrapper = await env.tester.mount(Run);

        await env.widgetRefresh();
        expect(wrapper.vm.$refs.indicator.style.transform).toBe('rotate(123deg)');

        // data source : expression
        widget.dataSource = 'expression';
        widget.sourceExpression = '{{VAR01}}';
        await env.widgetRefresh();
        await env.widgetRefresh();
        expect(wrapper.vm.$refs.indicator.style.transform).toBe('rotate(123deg)');
    })
});
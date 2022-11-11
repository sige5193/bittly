import WidgetTestHelper from '../../WidgetTestHelper.js';
import Run from '../Run.vue'
describe('@/modules/panel/widgets/gauge/Run.vue', () => {
    it('normal use', async () => {
        let widget = {
            minValue : 0,
            maxValue : 100,
            sizeWidth : 100,
        };
        let env = await WidgetTestHelper.setupEnvForRunning(widget);
        let wrapper = await env.tester.mount(Run);
        
        // data source : variable
        widget.dataSource = 'variable';
        widget.sourceVariable = 'VAR01';
        env.runtime.setVariableValue('VAR01', '33');
        await wrapper.vm.refresh();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.value).toBe('33');

        // data source : expression
        widget.dataSource = 'expression';
        widget.sourceExpression = '{{VAR01}}';
        env.runtime.setVariableValue('VAR01', '33');
        await wrapper.vm.refresh();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.value).toBe(33);

        wrapper.destroy();
    })
});
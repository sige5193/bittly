import WidgetTestHelper from '../../WidgetTestHelper.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/line-chart/Run.vue', () => {
    it('basic', async () => {
        let widget = {
            maxDataLength : 1,
            sizeHeight : 200,
            sizeWidth : 200,
            watchVariable : 'VAR01',
            dataExpression : '',
        };
        let env = await WidgetTestHelper.setupEnvForRunning(widget);
        let wrapper = await env.tester.mount(Run);

        env.runtime.setVariableValue('VAR01', 1);
        expect(wrapper.vm.data[0]).toBe(1);

        // with expression
        widget.dataExpression = '{{VAR01}} * 10';
        env.runtime.setVariableValue('VAR01', 2);
        expect(wrapper.vm.data[0]).toBe(20);
        
        // error handler
        let errorMessager = jest.fn();
        wrapper.vm.$error = errorMessager;
        widget.dataExpression = '{{NOT-EXISTS}}';
        env.runtime.setVariableValue('VAR01', 2);
        expect(errorMessager).toBeCalled();
        // error with bad expr
        widget.dataExpression = '{{VAR01}} * 1';
        env.runtime.setVariableValue('VAR01', '');
        expect(errorMessager).toBeCalledTimes(2);

        await env.tester.msleep(100);
        wrapper.vm.refresh();
        wrapper.destroy();
    })
});
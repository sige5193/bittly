import WidgetTestHelper from '../../WidgetTestHelper.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/led/Run.vue', () => {
    it('normal use', async () => {
        let widget = {
            mode : 'digital',
            color : 'green',
            dataSource : 'variable',
            sourceVariable : 'VAR01',
            minValue : 0,
            maxValue : 255,
        };
        let env = await WidgetTestHelper.setupEnvForRunning(widget);
        let wrapper = await env.tester.mount(Run);
        await env.widgetRefresh();

        let light = wrapper.find('.led-light');
        let className = light.element.className;

        expect(className.indexOf('green')).not.toBe(-1);
        expect(className.indexOf('on')).not.toBe(-1);

        // analog mode
        widget.sourceVariable = 'VAR01';
        env.runtime.setVariableValue('VAR01', '50');
        widget.mode = 'analog';
        await env.widgetRefresh();
        expect(wrapper.find('.led-light').element.style.boxShadow).toBe('0px -3px 20px 5px rgb(205 255 205)');
        await env.tester.msleep(100);

        // analog mode red
        widget.color = 'red';
        await env.widgetRefresh();
        expect(wrapper.find('.led-light').element.style.boxShadow).toBe('0px -3px 20px 5px rgb(255 205 205)');
        await env.tester.msleep(100);

        // analog mode blue
        widget.color = 'blue';
        await env.widgetRefresh();
        expect(wrapper.find('.led-light').element.style.boxShadow).toBe('0px -3px 20px 5px rgb(205 205 255)');
        await env.tester.msleep(100);

        // analog mode yellow
        widget.color = 'yellow';
        await env.widgetRefresh();
        expect(wrapper.find('.led-light').element.style.boxShadow).toBe('0px -3px 20px 5px rgb(255 255 205)');
        await env.tester.msleep(100);

        // analog mode gray
        widget.color = 'gray';
        await env.widgetRefresh();
        expect(wrapper.find('.led-light').element.style.boxShadow).toBe('0px -3px 20px 5px rgb(205 205 205)');
        await env.tester.msleep(100);

        // analog mode gray min
        widget.color = 'gray';
        env.runtime.setVariableValue('VAR01', '-100');
        await env.widgetRefresh();
        expect(wrapper.find('.led-light').element.style.boxShadow).toBe('0px -3px 20px 5px rgb(255 255 255)');
        await env.tester.msleep(100);

        // analog mode gray max
        widget.color = 'gray';
        env.runtime.setVariableValue('VAR01', '1000');
        await env.widgetRefresh();
        expect(wrapper.find('.led-light').element.style.boxShadow).toBe('0px -3px 20px 5px rgb(0 0 0)');
        await env.tester.msleep(100);

        // analog mode gray undefined value
        widget.color = 'gray';
        env.runtime.setVariableValue('VAR01', undefined);
        await env.widgetRefresh();
        expect(wrapper.find('.led-light').element.style.boxShadow).toBe('0px -3px 20px 5px rgb(255 255 255)');
        await env.tester.msleep(100);

        // data source : expression
        widget.dataSource = 'expression';
        widget.sourceExpression = '{{VAR01}}';
        env.runtime.setVariableValue('VAR01', '100');
        await env.widgetRefresh();
        expect(wrapper.find('.led-light').element.style.boxShadow).toBe('0px -3px 20px 5px rgb(155 155 155)');
    })
});
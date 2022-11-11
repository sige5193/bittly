import WidgetTestHelper from '../../WidgetTestHelper.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/timer/Run.vue', () => {
    it('normal use', async () => {
        let widget = {
            interval : '1',
            count : '2',
            action:"script",
            actionScript:'bittly.variableSet("VAR01",bittly.variableGet("VAR01")*1+1);',
        };
        let env = await WidgetTestHelper.setupEnvForRunning(widget);
        let wrapper = await env.tester.mount(Run);

        env.tester.click({ref:'btnStart'});
        await env.tester.msleep(3000);
        expect(env.runtime.getVariableValue('VAR01')).toBe(35);

        // failed to execute 
        widget.actionScript = 'function (';
        wrapper.vm.$error = jest.fn();
        env.tester.click({ref:'btnStart'});
        await env.tester.msleep(2000);
        expect(wrapper.vm.$error).toBeCalled();

        // start and destory before finished
        widget.actionScript = 'let i=0;';
        env.tester.click({ref:'btnStart'});
        wrapper.destroy();
    }, 10000)
});
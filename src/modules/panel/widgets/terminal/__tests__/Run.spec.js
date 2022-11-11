import WidgetTestHelper from '../../WidgetTestHelper.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/terminal/Run.vue', () => {
    it('basic', async () => {
        let widget = {
            sizeWidth : 100,
            sizeHeight : 100,
            sourceVariable : 'VAR01',
        };
        let env = await WidgetTestHelper.setupEnvForRunning(widget);
        let wrapper = await env.tester.mount(Run);
        
        env.runtime.setVariableValue('VAR01', 'THIS IS A TEST MESSAGE');
        await env.tester.msleep(100);
        expect(wrapper.text()).toContain('THIS IS A TEST MESSAGE');
    })
});
import WidgetTestHelper from '../../WidgetTestHelper.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/groupbox/Run.vue', () => {
    it('basic', async () => {
        let widget = {
            sizeWidth : 300,
            sizeHeight : 300,
            title : 'TEST',
        };
        let env = await WidgetTestHelper.setupEnvForRunning(widget);
        let wrapper = await env.tester.mount(Run);

        let title = wrapper.find('.grouptitle');
        expect(title.text()).toBe('TEST');
    })
});
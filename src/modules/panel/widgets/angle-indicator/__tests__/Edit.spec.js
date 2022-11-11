import Tester from '../../../../../utils/test/UnitTester.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/angle-indicator/Edit.vue', () => {
    it('basic', async () => {
        let panel = {
            variables : [
                {name : 'VAR_01',}
            ],
        };
        let widget = {};

        let tester = new Tester({
            props : {
                value : widget,
                panel : panel,
            },
        });
        await tester.setup();
        let wrapper = await tester.mount(Edit);

        expect(Edit.widgetInfo().name).toBe('angle-indicator');
    })
});
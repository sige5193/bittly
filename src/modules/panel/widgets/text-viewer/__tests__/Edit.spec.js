import Tester from '../../../../../utils/test/UnitTester.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/text-viewer/Edit.vue', () => {
    it('normal use', async () => {
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
            listeners : {
                input : newValue => widget = newValue,
            }
        });
        await tester.setup();
        await tester.mount(Edit);
        expect(Edit.widgetInfo().name).toBe('text-viewer');
    })
});
import Tester from '../../../../../utils/test/UnitTester.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/offset-angle-indicator/Edit.vue', () => {
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
                input : newValue => widget = newValue
            }
        });
        await tester.setup();
        let wrapper = await tester.mount(Edit);
        expect(widget.sizeHeight).toBe(200);
        expect(widget.sizeWidth).toBe(200);

        wrapper.vm.setting();
        await tester.msleep(200);

        expect(Edit.widgetInfo().name).toBe('offset-angle-indicator');
    })
});
import MdbPanel from '../../../../models/MdbPanel.js'
import UnitTester from '../../../../utils/test/UnitTester.js';
import Manager from '../Manager.vue'
describe('@/modules/panel/variable/Manager.vue', () => {
    it('basic', async ( ) => {
        let panel = new MdbPanel();
        panel.variables = [{"key":1666930766116,"name":"VAR01","defaultValue":"0"}];
        let tester = new UnitTester({
            props : {
                panel : panel,
            },
        });
        await tester.setup();
        await tester.mount(Manager);

        tester.wrapper.vm.$refs.editor.update = jest.fn(() => Promise.resolve({}));
        await tester.trigger({ref:'iconEdit_0'},'click');
        expect(tester.wrapper.vm.$refs.editor.update).toBeCalled();

        tester.wrapper.vm.$refs.editor.create = jest.fn(() => Promise.resolve({}));
        await tester.wrapper.vm.actionVariableAdd();
        expect(tester.wrapper.vm.$refs.editor.create).toBeCalled();

        await tester.wrapper.vm.actionVariableDelete(0);
        await tester.msleep(100);
        expect(panel.variables.length).toBe(0);
    })
});
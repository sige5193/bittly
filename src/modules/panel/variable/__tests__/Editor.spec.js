import MdbPanel from '../../../../models/MdbPanel.js'
import UnitTester from '../../../../utils/test/UnitTester.js';
import Editor from '../Editor.vue'
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
        await tester.mount(Editor);

        // create 
        let variableCreated = null;
        tester.wrapper.vm.create().then((variable) => variableCreated = variable);
        await tester.msleep(100);
        await tester.input({ref:'inputVarName'},'VAR01');
        await tester.emit({ref:'modalEdit'},'ok');
        expect(variableCreated).toBeNull();
        await tester.input({ref:'inputVarName'},'');
        await tester.emit({ref:'modalEdit'},'ok');
        expect(variableCreated).toBeNull();
        await tester.input({ref:'inputVarName'},'NEW-NAME');
        await tester.emit({ref:'modalEdit'},'ok');
        expect(variableCreated.name).toBe('NEW-NAME');

        // update
        tester.wrapper.vm.update(0);
        await tester.msleep(100);
        await tester.input({ref:'inputVarName'},'UPDATE-NAME');
        await tester.emit({ref:'modalEdit'},'ok');
        expect(panel.variables[0].name).toBe('UPDATE-NAME');

        // create and cancel
        tester.wrapper.vm.create();
        await tester.msleep(100);
        await tester.emit({ref:'modalEdit'},'cancel');
    })
});
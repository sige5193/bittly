import MdbPanel from '../../../../models/MdbPanel.js'
import UnitTester from '../../../../utils/test/UnitTester.js';
import Selector from '../Selector.vue'
describe('@/modules/panel/variable/Selector.vue', () => {
    it('basic', async ( ) => {
        let panel = new MdbPanel();
        panel.variables = [{"key":1666930766116,"name":"VAR01","defaultValue":"0"}];
        let variable = null;

        let tester = new UnitTester({
            props : {
                panel : panel,
                value : variable,
            },
            listeners : {
                input : newValue => variable = newValue,
            },
        });
        await tester.setup();
        await tester.mount(Selector);
        await tester.select({ref:'selectVariable'}, 'VAR01');
        expect(variable).toBe('VAR01');

        await tester.trigger({ref:'selectVariable'},'click');
        tester.wrapper.vm.$refs.editor.create = jest.fn(() => Promise.resolve({name:'NEW-VARIABLE'}));
        await tester.trigger({ref:'btnAddNewVariable'},'click');
        expect(variable).toBe('NEW-VARIABLE');
    })
});
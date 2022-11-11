import Tester from '../../../../../utils/test/UnitTester.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/label/Run.vue', () => {
    it('normal use', async () => {
        let panel = {};
        panel.runtime = {
            variables : {},
            setVariableValue : function( name, value ) {
                this.variables[name] = value;
            },
        };
        let widget = {
            text : 'TEST',
        };
        
        let tester = new Tester({
            props : {
                widget : widget,
                panel : panel,
                runtime : panel.runtime
            }
        });
        await tester.setup();
        let wrapper = await tester.mount(Run);

        expect(wrapper.text()).toBe('TEST');
    })
});
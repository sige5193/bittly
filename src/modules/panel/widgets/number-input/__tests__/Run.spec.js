import MdbPanel from '../../../../../models/MdbPanel.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/number-input/Run.vue', () => {
    it('normal use', async () => {
        let panel = new MdbPanel();
        panel.runtime = {
            variables : {},
            setVariableValue : function( name, value ) {
                this.variables[name] = value;
            },
        };
        let widget = {
            action : 'variable',
            targetVariable : 'TESTVARIABLE',
            defaultValue : 0,
            minValue : 0,
            maxValue : 200,
            stepValue : 1,
            sizeMode : 'small',
        };
        
        let tester = new Tester({
            props : {
                widget : widget,
                panel : panel,
                runtime : panel.runtime
            },
        });
        await tester.setup();
        let wrapper = await tester.mount(Run);
        let inputComponent = wrapper.findComponent({ref:'inputText'});
        let inputText = inputComponent.find('input');
        await inputText.setValue('123');

        expect(panel.runtime.variables['TESTVARIABLE']).toBe(123);
        expect(inputComponent.props('size')).toBe('small');
    })
});
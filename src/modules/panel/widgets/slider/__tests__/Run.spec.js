import MdbPanel from '../../../../../models/MdbPanel.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/slider/Run.vue', () => {
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
            minValue : 10,
            maxValue : 100,
            defaultValue : 20,
        };
        
        let tester = new Tester({
            props : {
                widget : widget,
                panel : panel,
                runtime : panel.runtime,
            }
        });
        await tester.setup();
        let wrapper = await tester.mount(Run);

        let slider = wrapper.findComponent({ref:'slider'});
        slider.vm.$emit('change', 50);
        slider.vm.$emit('afterChange', 50);
        await slider.vm.$nextTick();
        expect(panel.runtime.variables['TESTVARIABLE']).toBe(50);
    })
});
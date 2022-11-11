import MdbPanel from '../../../../../models/MdbPanel.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/radio/Run.vue', () => {
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
            defaultValue : '1',
            sizeMode : 'small',
            options : [
                {name:'O1',value:'1'},
                {name:'O2',value:'2'}
            ],
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

        let options = wrapper.findAllComponents({ref:'radioOption'});
        await options.at(1).trigger('click');
        expect(panel.runtime.variables['TESTVARIABLE']).toBe('2');

        let radioGroup = wrapper.findComponent({ref:'radioGroup'});
        expect(radioGroup.props('size')).toBe('small');
    })
});
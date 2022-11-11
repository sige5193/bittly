import MdbPanel from '../../../../../models/MdbPanel.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/number-viewer/Run.vue', () => {
    it('normal use', async () => {
        let runtime = {
            variables : {
                VAR01 : '33',
            },
            getVariableValue : function( varname ) {
                return this.variables[varname];
            },
        };
        let widget = {
            dataSource : 'variable',
            sourceVariable : 'VAR01',
            sizeMode : 'small',
        };
        
        let tester = new Tester({
            props : {
                widget : widget,
                panel : new MdbPanel(),
                runtime : runtime,
            }
        });
        await tester.setup();

        let wrapper = await tester.mount(Run);
        window.console.log = () => {};

        await wrapper.vm.refresh();
        await wrapper.vm.$nextTick();
        let input = wrapper.findComponent({ref:'input'});
        expect(input.props().value).toBe(33);
        expect(input.props('size')).toBe('small');

        // data source : expression
        widget.dataSource = 'expression';
        widget.sourceExpression = '{{VAR01}}';
        runtime.variables.VAR01 = '33';
        await wrapper.vm.refresh();
        await wrapper.vm.$nextTick();
        expect(input.props().value).toBe(33);
    })
});

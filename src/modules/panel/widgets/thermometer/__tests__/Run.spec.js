import MdbPanel from '../../../../../models/MdbPanel.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/thermometer/Run.vue', () => {
    it('normal use', async () => {
        let panel = new MdbPanel();
        let runtime = {
            variables : {
                VAR01 : '33',
            },
            getVariableValue : function( varname ) {
                return this.variables[varname];
            },
        };
        let widget = {
            sizeHeight : '300',
            sizeWidth : '100',
            tickCount : '10',
            minValue : 0,
            maxValue : 100,
            dataSource : 'variable',
            sourceVariable : 'VAR01',
        };
        
        let tester = new Tester({props:{widget,panel,runtime}});
        await tester.setup();
        let wrapper = await tester.mount(Run);
        window.console.log = () => {};

        await wrapper.vm.refresh();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.value).toBe('33');

        // data source : expression
        widget.dataSource = 'expression';
        widget.sourceExpression = '{{VAR01}}';
        runtime.variables.VAR01 = '33';
        await wrapper.vm.refresh();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.value).toBe(33);
    })
});
import MdbPanel from '../../../../../models/MdbPanel.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/progress-bar/Run.vue', () => {
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
            renderType:'line',
            minValue : 0,
            maxValue : 100,
            dataSource : 'variable',
            sourceVariable : 'VAR01',
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

        // data source : variable
        await wrapper.vm.refresh();
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toBe('33%');

        // data source : variable : min value
        runtime.variables.VAR01 = -100;
        await wrapper.vm.refresh();
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toBe('0%');

        // data source : variable : max value
        runtime.variables.VAR01 = 9100;
        await wrapper.vm.refresh();
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toBe('');

        // data source : expression
        widget.dataSource = 'expression';
        widget.sourceExpression = '{{VAR01}}';
        runtime.variables.VAR01 = '33';
        await wrapper.vm.refresh();
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toBe('33%');
    })

    it('data source = script', async () => {
        let runtime = {};
        let widget = {
            minValue : 0,
            maxValue : 100,
            dataSource : 'script',
            dataSourceScript : '$this.dataSet("value",33)',
        };
        let tester = new Tester({
            props : {
                widget : widget,
                panel : new MdbPanel(),
                runtime : runtime,
            }
        });
        await tester.setup();
        await tester.activeNewProject();
        
        let wrapper = await tester.mount(Run);

        await wrapper.vm.refresh();
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toBe('33%');
    })
});
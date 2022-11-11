import Tester from '../../../../../utils/test/UnitTester.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/offset-angle-indicator/Run.vue', () => {
    it('normal use', async () => {
        window.console.log = () => {};
        let panel = {};
        let runtime = {
            variables : {
                VAR01 : 90,
            },
            getVariableValue : function( varname ) {
                return this.variables[varname];
            },
        };
        let widget = {
            type : 'heading',
            dataSource : 'variable',
            sourceVariable : 'VAR01',
        };
        
        // heading
        let tester = new Tester({props : {widget,panel,runtime}});
        await tester.setup();
        let wrapper = await tester.mount(Run);

        await wrapper.vm.refresh();
        await tester.msleep(100);
        expect(wrapper.vm.$refs.indicator.style.transform).toBe('rotate(-90deg)');

        // horizon
        widget.type = 'horizon';
        tester = new Tester({props:{widget,panel,runtime}});
        await tester.setup();
        wrapper = await tester.mount(Run);
        await wrapper.vm.refresh();
        await tester.msleep(100);
        expect(wrapper.vm.$refs.indicator.style.top).toBe('-20px');
        
        // horizon
        runtime.variables.VAR01 = '-90';
        await wrapper.vm.refresh();
        await tester.msleep(100);
        expect(wrapper.vm.$refs.indicator.style.top).toBe('20px');

        // horizon
        runtime.variables.VAR01 = '15';
        await wrapper.vm.refresh();
        await tester.msleep(100);
        expect(wrapper.vm.$refs.indicator.style.top).toBe('-15px');

        // data source : expression
        runtime.variables.VAR01 = '15';
        widget.dataSource = 'expression';
        widget.sourceExpression = '{{VAR01}}';
        await wrapper.vm.refresh();
        await tester.msleep(100);
        expect(wrapper.vm.$refs.indicator.style.top).toBe('-15px');
    })
});
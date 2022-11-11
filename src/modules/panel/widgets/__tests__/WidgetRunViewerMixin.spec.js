import Tester from '../../../../utils/test/UnitTester.js'
import WidgetRunViewerMixin from '../WidgetRunViewerMixin.js'
describe('@/src/modules/panel/widgets/WidgetRunViewerMixin.js', () => {
    it('refresh from variable', async () => {
        let com = {
            name : 'TestWidget',
            mixins : [WidgetRunViewerMixin],
            template : '<div>HELLO</div>',
            methods : {
                getVariableMap : () => { return {VAR001:'prop001'}; }
            }
        };
        let widget = {
            dataSource : 'variable',
            sourceVariable : 'VAR001',
        };
        let runtime = {
            variables : {
                VAR001 : 'TEXT-CONTENT',
            },
            getVariableValue(varName) {
                return this.variables[varName];
            }
        };
        
        // com with variable map
        let tester = new Tester({
            props : {widget, runtime}
        });
        await tester.setup();
        let wrapper = await tester.mount(com);
        await wrapper.vm.refresh();
        expect(wrapper.vm.prop001).toBe('TEXT-CONTENT');

        // no variable map
        delete com.methods.getVariableMap;
        tester = new Tester({props : {widget, runtime}});
        await tester.setup();
        wrapper = await tester.mount(com);
        await wrapper.vm.refresh();

        // set prop
        wrapper.vm.dataSet('P','V');
        expect(wrapper.vm['P']).toBe('V');
    });

    it('refresh from script', async () => {
        let com = {
            name : 'TestWidget',
            mixins : [WidgetRunViewerMixin],
            template : '<div>HELLO</div>',
        };
        let widget = {
            dataSource : 'script',
            dataSourceScript : 'bittly.variableSet("Name001","Value001");',
        };
        let runtime = {
            setVariableValue (name, value) {
                this[name] = value;
            }
        };

        let tester = new Tester({props : {widget, runtime}});
        await tester.setup();
        await tester.activeNewProject();

        let wrapper = await tester.mount(com);
        await wrapper.vm.refresh();
        await tester.msleep(200);
        expect(runtime.Name001).toBe('Value001');

        // invalid script
        widget.dataSourceScript = 'function(';
        tester = new Tester({props : {widget, runtime}});
        await tester.setup();
        await tester.activeNewProject();
        wrapper = await tester.mount(com);
        wrapper.vm.$error = jest.fn();
        await wrapper.vm.refresh();
        expect(wrapper.vm.$error).toBeCalled();
        expect(wrapper.vm.$error.mock.calls[0][0].content).toBe('Failed to execute data source script : Function statements require a function name');
    });
});
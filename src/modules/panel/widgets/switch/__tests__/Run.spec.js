import MdbPanel from '../../../../../models/MdbPanel.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/switch/Run.vue', () => {
    it('normal use', async () => {
        let panel = new MdbPanel();
        panel.runtime = {
            variables : {},
            setVariableValue : function( name, value ) {
                this.variables[name] = value;
            },
        };
        let widget = {
            initStatus : true,
            valueOn : 'VALUE:ON',
            valueOff : 'VALUE:OFF',
            action : 'variable',
            targetVariable : 'TESTVARIABLE',
            sizeMode : 'small',
        };

        let tester = new Tester({
            props : {widget,panel,runtime:panel.runtime}
        });
        await tester.setup();
        let wrapper = await tester.mount(Run);

        let sw = wrapper.findComponent({ref:'switch'});
        sw.vm.$emit('change', false);
        await sw.vm.$nextTick();
        expect(panel.runtime.variables['TESTVARIABLE']).toBe('VALUE:OFF');
        expect(sw.props('size')).toBe('small');
    })
});
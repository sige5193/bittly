jest.mock('three', ()=>{}, {virtual:true});
jest.mock('three/examples/jsm/loaders/OBJLoader.js', ()=>{}, {virtual:true});
jest.mock('three/examples/jsm/controls/OrbitControls.js', ()=>{}, {virtual:true});
import Tester from '../../../../utils/test/UnitTester.js'
import WidgetEditRegisterMixin from '../WidgetEditRegisterMixin.js'
describe('@/src/modules/panel/widgets/WidgetEditRegisterMixin.js', () => {
    it('basic', async () => {
        let com = {
            name : 'TestWidget',
            mixins : [WidgetEditRegisterMixin],
            template : '<div>HELLO</div>',
        };
        
        let tester = new Tester();
        await tester.setup();
        let wrapper = await tester.mount(com);
        expect(wrapper.vm.isWidgetResizable('not-exists')).toBeFalsy();
        expect(wrapper.vm.isWidgetResizable('gauge')).toBeTruthy();
    });
});
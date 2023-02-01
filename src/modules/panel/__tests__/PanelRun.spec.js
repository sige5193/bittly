jest.mock('three', ()=>{}, {virtual:true});
jest.mock('three/examples/jsm/loaders/OBJLoader.js', ()=>{}, {virtual:true});
jest.mock('three/examples/jsm/controls/OrbitControls.js', ()=>{}, {virtual:true});
import MdbPanel from '../../../models/MdbPanel.js';
import Tester from '../../../utils/test/UnitTester.js'
import PanelRun from '../PanelRun.vue'
describe('@/modules/panel/PanelPanelRun.vue', () => {
    it('normal use', async () => {
        let panel = new MdbPanel();

        let tester = new Tester({
            props : {panel : new MdbPanel()}
        });
        await tester.setup();
        let wrapper = await tester.mount(PanelRun);
        let vm = wrapper.vm;

        wrapper.setProps({panel:panel});
        await vm.$nextTick();

        // open drawers
        await tester.click({ref:'btnToggleLog'});
        await tester.click({ref:'btnToggleVariable'});

        // refresh
        vm.refreshPanel();
        await tester.msleep(100);

        // close drawers
        await tester.click({ref:'btnToggleLog'});
        await tester.click({ref:'btnToggleVariable'});
        vm.actionLogDrawerVisibleChange(false);
        await tester.msleep(100);

        // switch to edit mode
        vm.actionModeSwitch();
        await tester.msleep(100);
        expect(tester.storeData['closeAllCommunicators']).toBe(undefined);
    })
});
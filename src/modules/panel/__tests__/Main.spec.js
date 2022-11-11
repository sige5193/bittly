jest.mock('three', ()=>{}, {virtual:true});
jest.mock('three/examples/jsm/loaders/OBJLoader.js', ()=>{}, {virtual:true});
jest.mock('three/examples/jsm/controls/OrbitControls.js', ()=>{}, {virtual:true});
import Tester from '../../../utils/test/UnitTester.js'
import Main from '../Main.vue'
import MdbPanel from '../../../models/MdbPanel.js'
describe('@/modules/panel/Main.vue', () => {
    it('normal use', async () => {
        let tester = new Tester();
        await tester.setup();
        await tester.activeNewProject();
        let panel = new MdbPanel();
        panel.projectId = tester.project.id;
        panel.name = 'TEST-P001';
        await panel.save();

        let wrapper = await tester.mount(Main);
        expect(wrapper.findAllComponents({ref:'menuItemPanel'}).length).toBe(1);

        // create new panel
        expect(wrapper.findComponent({ref:'emptyNoActivePanel'}).exists()).toBeTruthy();
        await tester.click({ref:'btnPanelCreate'});
        expect(wrapper.vm.panelActiveIndex).toBe(1);
        expect(wrapper.findAllComponents({ref:'menuItemPanel'}).length).toBe(2);
        expect(tester.wrapper.vm.panelActiveIndex).toBe(1);

        // click the first panel
        await wrapper.findAllComponents({ref:'menuItemPanel'}).at(0).trigger('click');
        await tester.wrapper.vm.$nextTick();
        expect(tester.wrapper.vm.panelActiveIndex).toBe(0);

        // project change
        await tester.wrapper.vm.handleCurProjectIdChanged();
        await tester.msleep(100);
    })
});
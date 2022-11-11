jest.mock('three', ()=>{}, {virtual:true});
jest.mock('three/examples/jsm/loaders/OBJLoader.js', ()=>{}, {virtual:true});
jest.mock('three/examples/jsm/controls/OrbitControls.js', ()=>{}, {virtual:true});
import Tester from '../../../utils/test/UnitTester.js'
import Panel from '../Panel.vue'
import MdbPanel from '../../../models/MdbPanel.js'
describe('@/modules/panel/Panel.vue', () => {
    it('normal use', async () => {
        let panel = new MdbPanel();
        panel.name = 'TEST-P001';

        let panelDeleteHandler = jest.fn();
        let tester = new Tester({
            props : {
                panel : panel,
                visiable : true,
            },
            listeners : {
                'panel-delete' : panelDeleteHandler,
            }
        });
        await tester.setup();
        await tester.activeNewProject();
        panel.projectId = tester.project.id;
        
        let wrapper = await tester.mount(Panel);
        wrapper.vm.mode = 'edit';
        await tester.msleep(100);
        await tester.emit({ref:'panelEdit'}, 'panel-delete');
        expect(panelDeleteHandler.mock.calls[0][0]).toBe(panel.id);
    })
});
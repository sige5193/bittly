import Setup from '../../../utils/test/UnitTester'
import ModalProjectCreate from '../ModalProjectCreate.vue'
import MdbProject from '@/models/MdbProject.js'
describe('components/modules/project/ModalProjectCreate.vue', () => {
    it('normal use', async () => {
        let tester = new Setup();
        await tester.setup();
        
        let project = new MdbProject();
        project.name = 'TEST PROJECT';
        project.description = 'TEST DESC';
        await project.save();
        await tester.activeProject(project);

        let wrapper = await tester.mount(ModalProjectCreate);
        await tester.msleep(1000);

        expect(wrapper.vm.$data.action).toBe('create');
    })
});
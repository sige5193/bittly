import Setup from '../../../utils/test/Setup.js'
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
        await tester.setActiveProject(project);

        let wrapper = await tester.mount(ModalProjectCreate);
        await tester.msleep(1000);

        expect(wrapper.vm.$data.action).toBe('create');
    })
});
import Setup from '../../../utils/test/Setup.js'
import Setting from '../Setting.vue'
import MdbProject from '@/models/MdbProject.js'
describe('components/modules/project/Setting.vue', () => {
    it('normal use', async () => {
        let tester = new Setup();
        await tester.setup();
        
        let project = new MdbProject();
        project.name = 'TEST PROJECT';
        project.description = 'TEST DESC';
        await project.save();
        await tester.setActiveProject(project);

        let wrapper = await tester.mount(Setting);
        await tester.msleep(1000);

        expect(wrapper.vm.$data.activePanel).toBe('base');
    })
});
import Setup from '../../../utils/test/UnitTester'
import PageProjectIndex from '../PageProjectIndex.vue'
import MdbProject from '@/models/MdbProject.js'
describe('components/modules/project/PageProjectIndex.vue', () => {
    it('normal use', async () => {
        let tester = new Setup();
        await tester.setup();
        
        let project = new MdbProject();
        project.name = 'TEST PROJECT';
        project.description = 'TEST DESC';
        await project.save();
        await tester.activeProject(project);

        let wrapper = await tester.mount(PageProjectIndex);
        await tester.msleep(1000);

        let projects = wrapper.findAll('.project');
        expect(projects.length).toBeGreaterThan(1);
        expect(wrapper.html()).toContain(project.name);
    })
});
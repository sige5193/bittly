import Setup from '../../../utils/test/Setup.js'
import DropdownProjectSwitch from '../DropdownProjectSwitch.vue'
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

        let wrapper = await tester.mount(DropdownProjectSwitch);
        await tester.msleep(1000);
        
        let curProjectName = wrapper.find('.cur-project-name');
        expect(curProjectName.text()).toBe('TEST PROJECT');
    })
});
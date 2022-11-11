import Setup from '../../../utils/test/Setup.js'
import PanelBaseInfo from '../PanelBaseInfo.vue'
import MdbProject from '@/models/MdbProject.js'
describe('components/modules/project/PanelBaseInfo.vue', () => {
    it('normal use', async () => {
        let tester = new Setup();
        await tester.setup();
        
        let project = new MdbProject();
        project.name = 'TEST PROJECT';
        project.description = 'TEST DESC';
        await project.save();
        await tester.setActiveProject(project);

        let wrapper = await tester.mount(PanelBaseInfo);
        await tester.msleep(1000);
        
        let inputName = wrapper.findComponent({ref:'inputName'}).find('input');
        expect(inputName.element.value).toBe('TEST PROJECT');
    })
});
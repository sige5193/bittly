import Setup from '../../../utils/test/Setup.js'
import PanelDelete from '../PanelDelete.vue'
import MdbProject from '@/models/MdbProject.js'
describe('components/modules/project/PanelDelete.vue', () => {
    it('source uuid not empty', async () => {
        let tester = new Setup();
        await tester.setup();
        
        let project = new MdbProject();
        project.name = 'TEST PROJECT';
        project.remoteUuid = 'XXX';
        await project.save();
        await tester.setActiveProject(project);

        let wrapper = await tester.mount(PanelDelete);
        await tester.msleep(1000);
        
        let checkboxDeleteRemoteProject = wrapper.findComponent({ref:'checkboxDeleteRemoteProject'});
        expect(checkboxDeleteRemoteProject.exists()).toBeTruthy();

        let deletePopConfirm = wrapper.findComponent({ref:'deletePopConfirm'});
        deletePopConfirm.vm.$emit('confirm');
        await deletePopConfirm.vm.$nextTick();
        let deletedProject = await MdbProject.findOne(project.id);
        expect(deletedProject).not.toBeNull();
    })

    it('source uuid empty', async () => {
        let tester = new Setup();
        await tester.setup();

        let project = new MdbProject();
        project.name = 'TEST PROJECT';
        await project.save();
        await tester.setActiveProject(project);

        let wrapper = await tester.mount(PanelDelete);
        await tester.msleep(1000);
        
        let checkboxDeleteRemoteProject = wrapper.findComponent({ref:'checkboxDeleteRemoteProject'});
        expect(checkboxDeleteRemoteProject.exists()).toBeFalsy();

        let deletePopConfirm = wrapper.findComponent({ref:'deletePopConfirm'});
        deletePopConfirm.vm.$emit('confirm');
        await deletePopConfirm.vm.$nextTick();
        
        await tester.msleep(1000);
        let deletedProject = await MdbProject.findOne(project.id);
        expect(deletedProject).toBeNull();
    })
});
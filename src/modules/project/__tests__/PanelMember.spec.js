import Setup from '../../../utils/test/UnitTester'
import PanelMember from '../PanelMember.vue'
import MdbProject from '@/models/MdbProject.js'
describe('components/modules/project/PanelMember.vue', () => {
    it('source uuid empty', async () => {
        let tester = new Setup();
        await tester.setup();
        
        let project = new MdbProject();
        project.name = 'TEST PROJECT';
        await project.save();
        await tester.activeProject(project);
        
        tester.mockBittlyApiClient.isGuest = () => false;
        tester.mockBittlyApiClient.projectMemberList = () => { return {success:true,data:[]}; };

        let wrapper = await tester.mount(PanelMember);
        await tester.msleep(1000);
        
        let alterNoRemoteProject = wrapper.findComponent({ref:'alterNoRemoteProject'});
        expect(alterNoRemoteProject.exists()).toBeTruthy();
        // expect(checkboxDeleteRemoteProject.exists()).toBeTruthy();

        // let deletePopConfirm = wrapper.findComponent({ref:'deletePopConfirm'});
        // deletePopConfirm.vm.$emit('confirm');
        // await deletePopConfirm.vm.$nextTick();
        // let deletedProject = await MdbProject.findOne(project.id);
        // expect(deletedProject).not.toBeNull();
    })

    it('source uuid not empty', async () => {
        let tester = new Setup();
        await tester.setup();
        
        let project = new MdbProject();
        project.name = 'TEST PROJECT';
        project.remoteUuid = "TEST UUID";
        await project.save();
        await tester.activeProject(project);

        tester.mockBittlyApiClient.isGuest = () => false;
        tester.mockBittlyApiClient.projectMemberList = () => { return {success:true,data:[]}; };
        let wrapper = await tester.mount(PanelMember);
        await tester.msleep(1000);

        let alterNoRemoteProject = wrapper.findComponent({ref:'alterNoRemoteProject'});
        expect(alterNoRemoteProject.exists()).toBeFalsy();
        
        // let checkboxDeleteRemoteProject = wrapper.findComponent({ref:'checkboxDeleteRemoteProject'});
        // expect(checkboxDeleteRemoteProject.exists()).toBeFalsy();

        // let deletePopConfirm = wrapper.findComponent({ref:'deletePopConfirm'});
        // deletePopConfirm.vm.$emit('confirm');
        // await deletePopConfirm.vm.$nextTick();
        
        // await Setup.msleep(1000);
        // let deletedProject = await MdbProject.findOne(project.id);
        // expect(deletedProject).toBeNull();
    })
});
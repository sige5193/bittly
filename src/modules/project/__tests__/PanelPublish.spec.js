import Setup from '../../../utils/test/Setup.js'
import PanelPublish from '../PanelPublish.vue'
import MdbProject from '@/models/MdbProject.js'
describe('components/modules/project/PanelPublish.vue', () => {
    window.remote = {
        process : {
            env : {
                NODE_ENV : 'development',
            }
        }
    };
    
    it('remote uuid != "" && source uuid === remote uuid => able to publish source project ', async () => {
        let tester = new Setup();
        await tester.setup();
        
        let project = new MdbProject();
        project.name = 'TEST PROJECT';
        project.remoteUuid = 'XXX';
        project.sourceUuid = 'XXX';
        await project.save();
        await tester.setActiveProject(project);

        let wrapper = await tester.mount(PanelPublish);
        await tester.msleep(1000);

        expect(wrapper.vm.$data.publishToSource).toBeTruthy();
        expect(wrapper.findComponent({ref:'targetTip'}).exists()).toBeTruthy();
        expect(wrapper.findComponent({ref:'btnPublishToNewProject'}).exists()).toBeTruthy();
    })

    it('source uuid != remote uuid ', async () => {
        let tester = new Setup();
        await tester.setup();
        
        let project = new MdbProject();
        project.name = 'TEST PROJECT';
        project.remoteUuid = 'XXX';
        project.sourceUuid = 'YYY';
        await project.save();
        await tester.setActiveProject(project);

        let wrapper = await tester.mount(PanelPublish);
        await tester.msleep(1000);
        
        expect(wrapper.vm.$data.publishToSource).toBeFalsy();
        expect(wrapper.findComponent({ref:'targetTip'}).exists()).toBeFalsy();
        expect(wrapper.findComponent({ref:'btnPublishToNewProject'}).exists()).toBeFalsy();
    })
});
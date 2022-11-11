import { mount } from '@vue/test-utils'
import Setup from '../../../utils/test/Setup.js'
import PanelUpdate from '../PanelUpdate.vue'
import MdbProject from '@/models/MdbProject.js'
describe('components/modules/project/PanelUpdate.vue', () => {
    it('remote uuid empty', async () => {
        let tester = new Setup();
        await tester.setup();
        
        let project = new MdbProject();
        project.name = 'TEST PROJECT';
        await project.save();
        await tester.setActiveProject(project);
        
        tester.mockBittlyApiClient.projectGet = function() { 
            return {
                success:true,
                data:{}
            }; 
        };
        tester.mockBittlyApiClient.projectVersionContentGet = function() {
            return {
                success:true,
                data:{}
            };
        };

        let wrapper = await tester.mount(PanelUpdate);
        await tester.msleep(1000);

        let alertRemoteProjectNotExists = wrapper.findComponent({ref:'alertRemoteProjectNotExists'});
        expect(alertRemoteProjectNotExists.exists()).toBeTruthy();

        let btnUpdate = wrapper.findComponent({ref:'btnUpdate'});
        expect(btnUpdate.exists()).toBeFalsy();
    })

    it('remote uuid not empty', async () => {
        let tester = new Setup();
        await tester.setup();
        
        let project = new MdbProject();
        project.name = 'TEST PROJECT';
        project.remoteUuid = 'TEST-REMOTE-UUID';
        await project.save();
        await tester.setActiveProject(project);
        
        tester.mockBittlyApiClient.projectGet = function() { 
            return {
                success:true,
                data:{}
            }; 
        };
        tester.mockBittlyApiClient.projectVersionContentGet = function() {
            return {
                success:true,
                data:{}
            };
        };

        let wrapper = await tester.mount(PanelUpdate);
        await tester.msleep(1000);
        
        let alertRemoteProjectNotExists = wrapper.findComponent({ref:'alertRemoteProjectNotExists'});
        expect(alertRemoteProjectNotExists.exists()).toBeFalsy();

        let btnUpdate = wrapper.findComponent({ref:'btnUpdate'});
        expect(btnUpdate.exists()).toBeTruthy();
    })
});
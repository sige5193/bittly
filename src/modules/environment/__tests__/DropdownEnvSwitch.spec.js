import TestCaseSetup from '../../../utils/test/UnitTester.js';
import DropdownEnvSwitch from '../DropdownEnvSwitch.vue'
import MdbEnvironment from '../../../models/MdbEnvironment.js';
describe('@/src/modules/environment/DropdownEnvSwitch.vue', () => {
    it('normal use', async ( ) => {
        let setup = new TestCaseSetup();
        await setup.setup();

        let project = await setup.activeNewProject();
        setup.prop('projectId', project.id);

        let env = new MdbEnvironment();
        env.name = 'ENV-001';
        env.content = 'ENV-CONTENT-001';
        env.projectId = project.id;
        await env.save();

        let wrapper = await setup.mount(DropdownEnvSwitch);
        await setup.click({ref:'btnDropdownTrigger'});
        await setup.emit({ref:'menu'}, 'click', [{key:'0'}]);
        expect(setup.storeData.envActivedIdSet).toBe(env.id);
    })
});
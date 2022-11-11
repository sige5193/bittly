import TestCaseSetup from '../../../utils/test/Setup.js';
import DropdownEnvSwitch from '../DropdownEnvSwitch.vue'
import MdbEnvironment from '../../../models/MdbEnvironment.js';
describe('@/src/modules/environment/DropdownEnvSwitch.vue', () => {
    it('normal use', async ( ) => {
        let setup = new TestCaseSetup();
        await setup.setup();

        let project = await setup.setActiveProject('new');
        setup.componentSetProp('projectId', project.id);

        let env = new MdbEnvironment();
        env.name = 'ENV-001';
        env.content = 'ENV-CONTENT-001';
        env.projectId = project.id;
        await env.save();

        let wrapper = await setup.mount(DropdownEnvSwitch);
        await setup.comButtonClick(wrapper, 'btnDropdownTrigger');
        await setup.msleep(500);
        await setup.comEmit(wrapper, 'menu', 'click', {key:'0'});
        await setup.msleep(500);
        expect(setup.storeData.envActivedIdSet).toBe(env.id);
    })
});
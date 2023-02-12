import TestCaseSetup from '../../../utils/test/UnitTester.js';
import DropdownEnvSwitch from '../DropdownEnvSwitch.vue'
import MdbEnvironment from '../../../models/MdbEnvironment.js';
describe('@/src/modules/environment/DropdownEnvSwitch.vue', () => {
    it('debug normal use', async ( ) => {
        let tester = new TestCaseSetup();
        await tester.setup();

        let project = await tester.activeNewProject();
        tester.prop('projectId', project.id);

        let env = new MdbEnvironment();
        env.name = 'ENV-001';
        env.content = 'ENV-CONTENT-001';
        env.projectId = project.id;
        await env.save();

        await tester.mount(DropdownEnvSwitch);
        await tester.click({ref:'btnDropdownTrigger'});
        await tester.emit({ref:'menu'}, 'click', [{key:'0'}]);
        expect(tester.wrapper.vm.$store.getters.envActivedId).toBe(env.id);
    })
});
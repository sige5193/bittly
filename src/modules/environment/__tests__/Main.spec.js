import TestCaseSetup from '../../../utils/test/UnitTester.js';
import Main from '../Main.vue'
import MdbEnvironment from '../../../models/MdbEnvironment.js';
describe('@/src/modules/environment/Main.vue', () => {
    it('debug normal use', async ( ) => {
        let setup = new TestCaseSetup();
        await setup.setup();

        let project = await setup.activeNewProject();
        setup.prop('projectId', project.id);
        
        let env = new MdbEnvironment();
        env.name = 'ENV-001';
        env.content = {};
        env.projectId = project.id;
        await env.save();

        await setup.mount(Main);
        await setup.msleep(500);
        await setup.emit({ref:'envMenu'}, 'click', [{key:'0'}]);
        await setup.input({ref:'inputName_0'}, 'ITEM-001');
        await setup.input({ref:'inputValue_0'}, 'VALUE-001');
        await setup.click({ref:'btnSave'});
        
        env = await MdbEnvironment.findOne(env.id);
        expect(env.content['ITEM-001'].value).toBe('VALUE-001');
    })
});
import TestCaseSetup from '../../../utils/test/Setup.js';
import Main from '../Main.vue'
import MdbEnvironment from '../../../models/MdbEnvironment.js';
describe('@/src/modules/environment/Main.vue', () => {
    it('normal use', async ( ) => {
        let setup = new TestCaseSetup();
        await setup.setup();

        let project = await setup.setActiveProject('new');
        setup.componentSetProp('projectId', project.id);
        
        let env = new MdbEnvironment();
        env.name = 'ENV-001';
        env.content = {};
        env.projectId = project.id;
        await env.save();

        let wrapper = await setup.mount(Main);
        await setup.msleep(500);
        await setup.comEmit(wrapper, 'envMenu', 'click', {key:'0'});
        await setup.msleep(500);
        await setup.comInputChange(wrapper, 'inputName_0', 'ITEM-001');
        await setup.comInputChange(wrapper, 'inputValue_0', 'VALUE-001');
        await setup.comButtonClick(wrapper, 'btnSave');
        await setup.msleep(200);
        
        env = await MdbEnvironment.findOne(env.id);
        expect(env.content['ITEM-001'].value).toBe('VALUE-001');
    })

    it('webdriver ui', async () => {
        let tester = new TestCaseSetup();
        await tester.setupWebDriver();
        await tester.webDriverClick('.app-module-environment');
        await tester.webDriverInput('.env-edit-name', "NEW-ENV-NAME");
        await tester.webDriverInput('.env-edit-item-name-0',"ENV-NAME-001");
        await tester.webDriverInput('.env-edit-item-value-0', "NEW-VALUE-001");
        await tester.webDriverInput('.env-edit-item-desc-0', "NEW-DESC-001");
        await tester.webDriverInput('.env-edit-item-name-1',"ENV-NAME-002");
        await tester.webDriverClick('.env-edit-btn-save');
        await tester.msleep(500);
        expect(await tester.webDriverElementExists('.ant-message-notice')).toBeTruthy();
        await tester.webDriverQuit();
    }, 60000);
});